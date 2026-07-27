import os
import sys
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

if sys.platform == 'win32':
  sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env'))

# Supabase Credentials
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL') or 'https://beehkcnxkibslwsadggr.supabase.co'
SUPABASE_KEY = os.getenv('SUPABASE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY') or 'sb_publishable_XOmupIautXOleBLA2flsxA_BDdvCThr'

# LinkedIn API Credentials
LINKEDIN_ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN', '').strip()
LINKEDIN_PERSON_URN = os.getenv('LINKEDIN_PERSON_URN', '').strip()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_user_profile_urn(access_token):
  """Fetch user URN from LinkedIn OpenID Connect /v2/userinfo or /v2/me endpoint"""
  headers = {"Authorization": f"Bearer {access_token}"}
  
  # 1. Try OpenID Connect /v2/userinfo
  try:
    res = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers)
    if res.status_code == 200:
      sub_id = res.json().get("sub")
      if sub_id:
        print(f"Found LinkedIn Member Sub ID via userinfo: {sub_id}")
        return f"urn:li:person:{sub_id}"
  except Exception as e:
    print(f"Note userinfo check: {e}")

  # 2. Try Legacy /v2/me
  try:
    res = requests.get("https://api.linkedin.com/v2/me", headers=headers)
    if res.status_code == 200:
      person_id = res.json().get("id")
      if person_id:
        print(f"Found LinkedIn Person ID via /v2/me: {person_id}")
        return f"urn:li:person:{person_id}"
  except Exception as e:
    print(f"Note /v2/me check: {e}")

  return None

def upload_linkedin_image_asset(access_token, author_urn, img_data):
  """Uploads an image (web URL or Base64 string) to LinkedIn API v2"""
  if not img_data or not access_token:
    return "NONE", []

  img_str = str(img_data).strip()

  if img_str.startswith("http://") or img_str.startswith("https://"):
    return "IMAGE", [{
      "status": "READY",
      "description": { "text": "Attached Image" },
      "originalUrl": img_str,
      "title": { "text": "Post Image" }
    }]

  if img_str.startswith("data:image/"):
    try:
      import base64
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

        up_headers = {
          "Authorization": f"Bearer {access_token}",
          "Content-Type": mime_type
        }
        upload_res = requests.put(upload_url, headers=up_headers, data=image_bytes)
        if upload_res.status_code in [200, 201]:
          return "IMAGE", [{
            "status": "READY",
            "description": { "text": "Attached Image" },
            "media": asset_urn,
            "title": { "text": "Post Image" }
          }]
    except Exception as err:
      print(f"B64 Image Upload Note: {err}")

  return "NONE", []

def publish_to_linkedin():
  print("⚡ Checking Supabase for due LinkedIn posts...")

  try:
    res = supabase.table('content_calendar').select('*').order('scheduled_at').execute()
    all_posts = res.data or []
  except Exception as e:
    print(f"Supabase fetch error: {e}")
    all_posts = []

  # Filter posts for LinkedIn
  linkedin_posts = [
    p for p in all_posts
    if str(p.get('platform', '')).lower() == 'linkedin' and p.get('status') in ['scheduled', 'draft']
  ]

  print(f"Found {len(linkedin_posts)} post(s) ready for LinkedIn.")

  if not LINKEDIN_ACCESS_TOKEN:
    print("\n⚠️ LINKEDIN_ACCESS_TOKEN not found in agent/.env!")
    return

  author_urn = LINKEDIN_PERSON_URN or get_user_profile_urn(LINKEDIN_ACCESS_TOKEN)
  if not author_urn:
    print("⚠️ Could not determine LinkedIn Author URN. Please ensure scope includes openid/w_member_social.")
    return

  print(f"Using LinkedIn Author URN: {author_urn}")

  for post in linkedin_posts:
    post_id = post.get('id')
    caption = post.get('caption') or post.get('title')
    img_data = post.get('image_url') or post.get('mediaUrl') or post.get('image')

    print(f"\n🚀 Publishing Post to LinkedIn (ID: {post_id})...")
    print(f"Content: \"{caption[:80]}...\"")

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
        print(f"✅ SUCCESS! Post published to LinkedIn! Post URN: {ugc_id}")

        # Update status in Supabase
        if post_id:
          supabase.table('content_calendar').update({
            'status': 'published',
            'updated_at': datetime.now().isoformat()
          }).eq('id', post_id).execute()
          print(f"✅ Updated post status to 'published' in Supabase database!")
        break
      else:
        print(f"❌ LinkedIn API Response ({response.status_code}): {response.text}")

    except Exception as err:
      print(f"❌ Failed to publish post to LinkedIn: {err}")

if __name__ == '__main__':
  publish_to_linkedin()
