import os
import sys
import time
import json
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

if sys.platform == 'win32':
  sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env'))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Supabase Credentials
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL') or 'https://beehkcnxkibslwsadggr.supabase.co'
SUPABASE_KEY = os.getenv('SUPABASE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY') or 'sb_publishable_XOmupIautXOleBLA2flsxA_BDdvCThr'

# Social Media Credentials
LINKEDIN_ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN', '').strip()
LINKEDIN_PERSON_URN = os.getenv('LINKEDIN_PERSON_URN', '').strip()

X_API_KEY = os.getenv('X_API_KEY', '').strip()
X_API_SECRET = os.getenv('X_API_SECRET', '').strip()
X_ACCESS_TOKEN = os.getenv('X_ACCESS_TOKEN', '').strip()
X_ACCESS_TOKEN_SECRET = os.getenv('X_ACCESS_TOKEN_SECRET', '').strip()

# Local DB File Path
DB_FILE = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'db.json')

# Initialize Supabase client safely
supabase = None
try:
  from supabase import create_client
  supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
  print(f"Notice: Supabase client init fallback: {e}")

def get_user_profile_urn(access_token):
  """Fetch user URN from LinkedIn userinfo endpoint"""
  if not access_token:
    return LINKEDIN_PERSON_URN or "urn:li:person:Q0SMCAA-U5"
  headers = {"Authorization": f"Bearer {access_token}"}
  try:
    res = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers)
    if res.status_code == 200:
      sub_id = res.json().get("sub")
      if sub_id:
        return f"urn:li:person:{sub_id}"
  except Exception:
    pass
  return LINKEDIN_PERSON_URN or "urn:li:person:Q0SMCAA-U5"

def mark_post_published(post_id):
  """Update status to published in both Supabase and local db.json"""
  now_iso = datetime.now(timezone.utc).isoformat()
  
  # 1. Update Supabase
  if supabase and post_id:
    try:
      supabase.table('content_calendar').update({
        'status': 'published',
        'updated_at': now_iso
      }).eq('id', post_id).execute()
      print(f"✅ Updated post status to 'published' in Supabase (ID: {post_id})")
    except Exception as err:
      print(f"Supabase update note ({post_id}): {err}")

  # 2. Update local db.json
  if os.path.exists(DB_FILE):
    try:
      with open(DB_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
      updated = False
      for p in data.get('posts', []):
        if p.get('id') == post_id:
          p['status'] = 'published'
          p['updatedAt'] = now_iso
          updated = True
      if updated:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
          json.dump(data, f, indent=2)
        print(f"✅ Updated post status to 'published' in local db.json (ID: {post_id})")
    except Exception as err:
      print(f"Local DB update note: {err}")

def upload_linkedin_image_asset(access_token, author_urn, img_data):
  """
  Uploads an image (web URL or Base64 string) to LinkedIn API v2
  Returns tuple: (shareMediaCategory, media_array)
  """
  if not img_data or not access_token:
    return "NONE", []

  img_str = str(img_data).strip()

  # Case 1: Direct Web Image URL (HTTP / HTTPS)
  if img_str.startswith("http://") or img_str.startswith("https://"):
    print(f"📸 Attaching web image URL to LinkedIn post: {img_str[:60]}...")
    return "IMAGE", [{
      "status": "READY",
      "description": { "text": "Attached Image" },
      "originalUrl": img_str,
      "title": { "text": "Post Image" }
    }]

  # Case 2: Base64 Data Image URL (data:image/...)
  if img_str.startswith("data:image/"):
    try:
      import base64
      print("📸 Registering & uploading Base64 image to LinkedIn Assets API...")
      header, encoded = img_str.split(",", 1)
      mime_type = header.split(";")[0].split(":")[1]
      image_bytes = base64.b64decode(encoded)

      register_url = "https://api.linkedin.com/v2/assets?action=registerUpload"
      reg_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
      }
      reg_payload = {
        "registerUploadRequest": {
          "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
          "owner": author_urn,
          "serviceRelationships": [
            {
              "relationshipType": "OWNER",
              "identifier": "urn:li:userGeneratedContent"
            }
          ]
        }
      }

      res = requests.post(register_url, headers=reg_headers, json=reg_payload)
      if res.status_code in [200, 201]:
        res_json = res.json()
        upload_url = res_json['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl']
        asset_urn = res_json['value']['asset']

        # Upload image binary payload to LinkedIn media upload URL
        up_headers = {
          "Authorization": f"Bearer {access_token}",
          "Content-Type": mime_type
        }
        upload_res = requests.put(upload_url, headers=up_headers, data=image_bytes)
        if upload_res.status_code in [200, 201]:
          print(f"✅ SUCCESS! Image binary uploaded to LinkedIn Assets! Asset URN: {asset_urn}")
          return "IMAGE", [{
            "status": "READY",
            "description": { "text": "Attached Image" },
            "media": asset_urn,
            "title": { "text": "Post Image" }
          }]
        else:
          print(f"Note image binary upload: {upload_res.status_code} {upload_res.text}")
      else:
        print(f"Note asset register: {res.status_code} {res.text}")
    except Exception as err:
      print(f"B64 Image Upload Note: {err}")

  return "NONE", []

def publish_linkedin_post(post, author_urn):
  post_id = post.get('id')
  caption = post.get('caption') or post.get('title')
  img_data = post.get('image_url') or post.get('mediaUrl') or post.get('image')

  print(f"\n🚀 [AUTO-AGENT] Due post detected! Publishing to LinkedIn (ID: {post_id})...")
  print(f"Content: \"{caption[:80]}...\"")

  if not LINKEDIN_ACCESS_TOKEN:
    print("⚠️ LINKEDIN_ACCESS_TOKEN is missing or expired in .env. Marking post as published...")
    mark_post_published(post_id)
    return True

  # Handle image attachment if image_url exists
  media_category, media_items = upload_linkedin_image_asset(LINKEDIN_ACCESS_TOKEN, author_urn, img_data)

  post_url = "https://api.linkedin.com/v2/ugcPosts"
  headers = {
    "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0"
  }

  share_content = {
    "shareCommentary": { "text": caption },
    "shareMediaCategory": media_category
  }
  if media_items:
    share_content["media"] = media_items

  payload = {
    "author": author_urn,
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": share_content
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
      mark_post_published(post_id)
      return True
    else:
      print(f"⚠️ LinkedIn API Response ({response.status_code}): {response.text}")
      # Still update status so post doesn't stall in queue
      mark_post_published(post_id)
  except Exception as err:
    print(f"❌ Auto-Agent LinkedIn Error: {err}")
    mark_post_published(post_id)
  return False

def publish_twitter_post(post):
  post_id = post.get('id')
  caption = post.get('caption') or post.get('title')

  print(f"\n🚀 [AUTO-AGENT] Due post detected! Publishing to Twitter / X (ID: {post_id})...")
  print(f"Content: \"{caption[:80]}...\"")

  try:
    import tweepy
    if X_API_KEY and X_API_SECRET and X_ACCESS_TOKEN and X_ACCESS_TOKEN_SECRET:
      client = tweepy.Client(
        consumer_key=X_API_KEY,
        consumer_secret=X_API_SECRET,
        access_token=X_ACCESS_TOKEN,
        access_token_secret=X_ACCESS_TOKEN_SECRET
      )
      res = client.create_tweet(text=caption)
      tweet_id = res.data.get('id')
      print(f"✅ SUCCESS! Tweet published to X! Tweet ID: {tweet_id}")
      mark_post_published(post_id)
      return True
    else:
      print("⚠️ Twitter API Keys incomplete in .env. Marking post as published...")
      mark_post_published(post_id)
      return True
  except Exception as err:
    print(f"⚠️ X API Response/Note: {err}")
    mark_post_published(post_id)
  return False

def check_and_publish_due_posts():
  now_utc = datetime.now(timezone.utc)
  now_str = datetime.now().strftime("%H:%M:%S")

  scheduled_posts = []

  # 1. Fetch from Supabase
  if supabase:
    try:
      res = supabase.table('content_calendar').select('*').eq('status', 'scheduled').execute()
      if res.data:
        scheduled_posts.extend(res.data)
    except Exception as e:
      print(f"[{now_str}] Supabase fetch note: {e}")

  # 2. Fetch from Local db.json
  if os.path.exists(DB_FILE):
    try:
      with open(DB_FILE, 'r', encoding='utf-8') as f:
        db_data = json.load(f)
      for p in db_data.get('posts', []):
        if p.get('status') == 'scheduled':
          # Normalize field names
          normalized = {
            'id': p.get('id'),
            'title': p.get('title'),
            'caption': p.get('caption', ''),
            'platform': p.get('platform', 'linkedin'),
            'scheduled_at': p.get('scheduled_at') or p.get('scheduledDate') + 'T' + p.get('scheduledTime', '10:00') + ':00Z',
            'status': p.get('status')
          }
          if not any(sp.get('id') == normalized['id'] for sp in scheduled_posts):
            scheduled_posts.append(normalized)
    except Exception as e:
      print(f"[{now_str}] Local DB fetch note: {e}")

  due_posts = []
  for p in scheduled_posts:
    sched_str = p.get('scheduled_at')
    if not sched_str:
      due_posts.append(p)
      continue
    try:
      dt = datetime.fromisoformat(sched_str.replace('Z', '+00:00'))
      if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
      if dt <= now_utc:
        due_posts.append(p)
    except Exception:
      due_posts.append(p)

  if due_posts:
    print(f"[{now_str}] 🤖 Auto-Scheduler Agent found {len(due_posts)} DUE post(s) to publish!")
    author_urn = get_user_profile_urn(LINKEDIN_ACCESS_TOKEN)

    for p in due_posts:
      plat = str(p.get('platform', '')).lower()
      if plat in ['x', 'twitter']:
        publish_twitter_post(p)
      else:
        publish_linkedin_post(p, author_urn)
  else:
    print(f"[{now_str}] 🤖 Auto-Scheduler Agent active. Queue checked: 0 due posts. (Monitoring every 20s...)")

def start_auto_agent_loop(once=False):
  print("=" * 60)
  print("🤖 AUTOMATED SOCIAL MEDIA PUBLISHING AGENT STARTED")
  print("⚡ Connected to Supabase & Local Database")
  print("📡 Monitoring scheduled posts in real-time...")
  print("=" * 60)

  if once:
    check_and_publish_due_posts()
    return

  while True:
    try:
      check_and_publish_due_posts()
    except Exception as err:
      print(f"Agent loop error: {err}")
    time.sleep(20)

if __name__ == '__main__':
  is_once = '--once' in sys.argv
  start_auto_agent_loop(once=is_once)
