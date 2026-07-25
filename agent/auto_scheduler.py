import os
import sys
import time
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

if sys.platform == 'win32':
  sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env'))

# Supabase Credentials
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL') or 'https://beehkcnxkibslwsadggr.supabase.co'
SUPABASE_KEY = os.getenv('SUPABASE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY') or 'sb_publishable_XOmupIautXOleBLA2flsxA_BDdvCThr'

# LinkedIn Credentials
LINKEDIN_ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN', '').strip()
LINKEDIN_PERSON_URN = os.getenv('LINKEDIN_PERSON_URN', '').strip()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_user_profile_urn(access_token):
  """Fetch user URN from LinkedIn userinfo endpoint"""
  headers = {"Authorization": f"Bearer {access_token}"}
  try:
    res = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers)
    if res.status_code == 200:
      sub_id = res.json().get("sub")
      if sub_id:
        return f"urn:li:person:{sub_id}"
  except Exception as e:
    pass
  return LINKEDIN_PERSON_URN or "urn:li:person:Q0SMCAA-U5"

def publish_linkedin_post(post, author_urn):
  post_id = post.get('id')
  caption = post.get('caption') or post.get('title')

  print(f"\n🚀 [AUTO-AGENT] Due post detected! Publishing to LinkedIn (ID: {post_id})...")
  print(f"Content: \"{caption[:80]}...\"")

  post_url = "https://api.linkedin.com/v2/ugcPosts"
  headers = {
    "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0"
  }

  payload = {
    "author": author_urn,
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": caption
        },
        "shareMediaCategory": "NONE"
      }
    },
    "visibility": {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  }

  try:
    response = requests.post(post_url, headers=headers, json=payload)
    if response.status_code in [200, 201]:
      res_data = response.json()
      ugc_id = res_data.get('id', 'published')
      print(f"✅ SUCCESS! Live post published to LinkedIn! Share URN: {ugc_id}")

      # Update status in Supabase database
      supabase.table('content_calendar').update({
        'status': 'published',
        'updated_at': datetime.now(timezone.utc).isoformat()
      }).eq('id', post_id).execute()
      print(f"✅ Updated post status to 'published' in Supabase database!\n")
      return True
    else:
      print(f"❌ LinkedIn API Response ({response.status_code}): {response.text}")
  except Exception as err:
    print(f"❌ Auto-Agent LinkedIn Error: {err}")
  return False

def check_and_publish_due_posts():
  now_utc = datetime.now(timezone.utc)
  now_str = datetime.now().strftime("%H:%M:%S")

  try:
    res = supabase.table('content_calendar').select('*').eq('status', 'scheduled').execute()
    scheduled_posts = res.data or []
  except Exception as e:
    print(f"[{now_str}] Supabase fetch error: {e}")
    return

  due_posts = []
  for p in scheduled_posts:
    sched_str = p.get('scheduled_at')
    if not sched_str:
      continue
    try:
      # Parse scheduled time
      dt = datetime.fromisoformat(sched_str.replace('Z', '+00:00'))
      if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
      
      # Check if post is due (or scheduled within current time)
      if dt <= now_utc:
        due_posts.append(p)
    except Exception:
      # Fallback for timestamp parsing
      due_posts.append(p)

  if due_posts:
    print(f"[{now_str}] 🤖 Auto-Scheduler Agent found {len(due_posts)} DUE post(s) to publish!")
    author_urn = get_user_profile_urn(LINKEDIN_ACCESS_TOKEN)

    for p in due_posts:
      plat = str(p.get('platform', '')).lower()
      if plat == 'linkedin' and LINKEDIN_ACCESS_TOKEN:
        publish_linkedin_post(p, author_urn)
  else:
    print(f"[{now_str}] 🤖 Auto-Scheduler Agent active. Queue checked: 0 due posts. (Monitoring every 20s...)")

def start_auto_agent_loop():
  print("=" * 60)
  print("🤖 AUTOMATED SOCIAL MEDIA PUBLISHING AGENT STARTED")
  print("⚡ Connected to Supabase content_calendar table")
  print("📡 Monitoring scheduled posts in real-time...")
  print("=" * 60)

  while True:
    try:
      check_and_publish_due_posts()
    except Exception as err:
      print(f"Agent loop error: {err}")
    time.sleep(20) # Check Supabase queue every 20 seconds

if __name__ == '__main__':
  start_auto_agent_loop()
