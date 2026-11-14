import { supabase } from "./supabase";

export interface AvatarUploadResult {
  publicUrl: string;
  filePath: string;
  userId: string;
}

/**
 * Converts a base64 `data:image/...` URL into a browser `File` instance
 * so it can be uploaded to a user-scoped path in Supabase Storage.
 */
export function dataUrlToFile(
  dataUrl: string,
  defaultBaseName = "avatar"
): File | null {
  try {
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return null;
    }
    const parts = dataUrl.split(",");
    if (parts.length < 2) return null;

    const mimeMatch = parts[0].match(/data:(image\/[a-zA-Z0-9+.-]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    const ext =
      mimeType
        .split("/")[1]
        ?.toLowerCase()
        .replace("jpeg", "jpg")
        .replace(/[^a-z0-9]/g, "") || "png";

    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new File([ab], `${defaultBaseName}.${ext}`, { type: mimeType });
  } catch (err) {
    console.warn("Failed to convert data URL to File:", err);
    return null;
  }
}

/**
 * Persists a public avatar URL into the `public.profiles` table for the given
 * user ID. Performs an `.update()` first (compatible with tables where rows are
 * pre-created by an auth trigger and only UPDATE RLS is enabled) and falls back
 * to `.upsert()` if no existing profile row matched.
 */
export async function persistAvatarUrlToProfilesTable(
  userId: string,
  publicUrl: string
): Promise<void> {
  const { data: updatedRows, error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId)
    .select("id, avatar_url");

  if (!updateError && Array.isArray(updatedRows) && updatedRows.length > 0) {
    return;
  }

  // Fallback to upsert if no existing row was updated
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        avatar_url: publicUrl
      },
      { onConflict: "id" }
    );

  if (upsertError && updateError) {
    throw new Error(
      `Failed to save avatar URL to profiles table: ${updateError.message || upsertError.message}`
    );
  }
}

/**
 * Uploads a user avatar to the Supabase Storage `avatars` bucket using a
 * user-scoped path (`${userId}/avatar-${timestamp}.${fileExt}`), generates
 * the public URL, saves `avatar_url` into the `public.profiles` table,
 * and syncs the updated avatar URL with the user's Supabase Auth metadata.
 *
 * @param file - The image File to upload
 * @returns The resulting public URL, storage filePath, and userId
 */
export async function uploadUserAvatar(file: File): Promise<AvatarUploadResult> {
  // 1. Resolve the currently authenticated user ID
  let userId: string | null = null;
  const { data: sessionData } = await supabase.auth.getSession();
  userId = sessionData?.session?.user?.id || null;

  if (!userId) {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      throw new Error(
        authError?.message || "User must be authenticated to upload an avatar."
      );
    }
    userId = user.id;
  }

  // 2. Build a sanitized, unique user-scoped storage path (`${userId}/...`)
  const rawExtension = file.name.split(".").pop() || "png";
  const fileExt = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;
  const contentType = file.type || `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

  // 3. Upload the file to the `avatars` bucket in Supabase Storage
  // Use `upsert: false` first so INSERT-only Storage RLS policies succeed cleanly
  let { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType
    });

  if (uploadError) {
    const retryResult = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType
      });
    uploadError = retryResult.error;
  }

  if (uploadError) {
    throw new Error(`Failed to upload avatar to storage: ${uploadError.message}`);
  }

  // 4. Generate the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    throw new Error("Failed to generate public URL for uploaded avatar.");
  }

  // 5. Persist the public URL into the `public.profiles` table
  await persistAvatarUrlToProfilesTable(userId, publicUrl);

  // 6. Sync the updated avatar URL with the user's Auth metadata
  const { error: updateUserError } = await supabase.auth.updateUser({
    data: {
      avatar_url: publicUrl,
      profilePic: publicUrl
    }
  });

  if (updateUserError) {
    console.warn(
      "Warning syncing avatar URL with auth metadata:",
      updateUserError.message
    );
  }

  return {
    publicUrl,
    filePath,
    userId
  };
}
