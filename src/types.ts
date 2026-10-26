/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string;
  title: string;
  count: number;
  color: "amber" | "teal" | "navy";
  category: "doctrine" | "prophecy" | "devotional" | "live";
  description: string;
  badge: string;
  iconName: "book" | "shield" | "flame" | "clock" | "bookmark" | "stars" | "calendar" | "video";
}

export interface UserAccount {
  name: string;
  email: string;
  isSda: boolean;
  firstTrack: string;
  role?: "Teacher" | "Student" | "Pastor" | "SabbathSchoolTeacher" | "LayEvangelist";
  isGuest?: boolean;
  emailVerified: boolean;
  googleId?: string;
  profilePic?: string;
  password?: string;
  autoQuarterlyUpdate?: boolean;
}

export interface Scripture {
  id: string;
  reference: string;
  text: string;
  keywords: string[];
}
