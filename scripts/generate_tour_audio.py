import asyncio
import os
import re
import edge_tts

VOICE = "en-US-AndrewMultilingualNeural"
OUTPUT_DIR = os.path.join(os.getcwd(), "public", "audio", "tour")
os.makedirs(OUTPUT_DIR, exist_ok=True)

STEPS = [
    (
        "welcome.mp3",
        "Grace and peace to you, Jeremy. I am Elder Stephen, your AI Bible study mentor. Many people read the Bible again and again without truly retaining or applying what they learn. Using our STBA Study System, we help you understand Scripture deeply, remember it clearly, and use it meaningfully in your daily life. Click the button below to tour your dashboard."
    ),
    (
        "cluster_mentor.mp3",
        "Elder Stephen AI Mentor. Welcome to your study command center, Jeremy! We have grouped your AI mentoring tools so you can study without distraction: Elder Stephen's Corner, Ask STBA AI Console, and Weekly Study Recap."
    ),
    (
        "cluster_study_modes.mp3",
        "Seven Study Modes for Mastery. All seven STBA study modes are unified into a single launchpad right above your Spiritual Learning Journey gauges: Bible Study Mode, Study Tracks, Doctrine Navigator, Active Recall, Teach It Studio, Notebook, and Sabbath School."
    ),
    (
        "cluster_navigation.mp3",
        "Navigation Drawer and Command Bar. Your top workspace bar keeps navigation and real-time study alerts within one click: Slide-Out Navigation Drawer, Live Notifications Bell, and Help Center Quick Access."
    ),
    (
        "cluster_profile_transition.mp3",
        "Open Account Profile Settings. Now let us personalize your Disciple Profile! Click your Account Profile avatar in the top-right corner, or click the button below, to upload your avatar and inspect your Journal and Analytics."
    ),
    (
        "profile_avatar.mp3",
        "Disciple Profile and Avatar Upload. Welcome to your Disciple Profile! Here your registration date, Level 1 Academic Rank, and zeroed-out Scribal Heatmap and Achievements are displayed. Upload your avatar image now. The tour will pause while you upload and resume automatically once saved!"
    ),
    (
        "profile_journal.mp3",
        "Scribal Spiritual Journal. We have switched to your My Journal tab. Your Scribal Spiritual Journal is your sacred space for personal devotions, exegesis reflections, and prayer insights."
    ),
    (
        "profile_analytics.mp3",
        "User Progress and Mastery Analytics. Here in the User Stats tab, your comprehensive Mastery Analytics, Milestones and Honors, and Ecosystem Integration cards monitor your long-term growth toward total Bible mastery."
    ),
    (
        "profile_exit.mp3",
        "Exit Back to Your Dashboard. Your Disciple Profile, Scribal Journal, and Mastery Analytics tour is complete! Click the glowing green Return to Desktop button to head back to your Dashboard and initiate Study Tracks."
    ),
    (
        "conclusion.mp3",
        "Welcome back to your dashboard, Jeremy. Your progress metrics are cleanly initialized at zero so every verse you master reflects your real study activity. I have highlighted Study Tracks for you. Let us initiate your first course on the 28 Fundamental Beliefs and Second Timothy two fifteen to begin transforming reading into lifelong retention."
    )
]

def clean_text(t):
    t = t.replace("—", ", ").replace("–", ", ").replace("'", "'").replace('"', '"').replace('"', '"')
    return t

async def generate_step(filename, text):
    out_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
        print(f"Already exists: {filename} ({os.path.getsize(out_path)/1024:.1f} KB)")
        return
    text = clean_text(text)
    for attempt in range(1, 4):
        try:
            print(f"Generating {filename} (attempt {attempt})...")
            communicate = edge_tts.Communicate(text, VOICE)
            await communicate.save(out_path)
            size_kb = os.path.getsize(out_path) / 1024
            if size_kb > 5:
                print(f" -> Saved {filename} ({size_kb:.1f} KB)")
                return
        except Exception as e:
            print(f" -> Retry error on {filename}: {e}")
            await asyncio.sleep(1.0)

async def generate_all():
    for filename, text in STEPS:
        await generate_step(filename, text)
        await asyncio.sleep(0.3)

if __name__ == "__main__":
    asyncio.run(generate_all())
