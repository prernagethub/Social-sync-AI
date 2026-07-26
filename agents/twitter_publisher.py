import os
import sys
import tweepy
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

if sys.platform == 'win32':
  sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env'))

# Credentials
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL') or 'https://beehkcnxkibslwsadggr.supabase.co'
SUPABASE_KEY = os.getenv('SUPABASE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY') or 'sb_publishable_XOmupIautXOleBLA2flsxA_BDdvCThr'

X_API_KEY = os.getenv('X_API_KEY', '').strip()
X_API_SECRET = os.getenv('X_API_SECRET', '').strip()
X_ACCESS_TOKEN = os.getenv('X_ACCESS_TOKEN', '').strip()
X_ACCESS_TOKEN_SECRET = os.getenv('X_ACCESS_TOKEN_SECRET', '').strip()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_twitter_client():
  """Initialize Tweepy API v2 Client with OAuth 1.0a User Context"""
  if not (X_API_KEY and X_API_SECRET and X_ACCESS_TOKEN and X_ACCESS_TOKEN_SECRET):
    return None

  try:
    client = tweepy.Client(
      consumer_key=X_API_KEY,
      consumer_secret=X_API_SECRET,
      access_token=X_ACCESS_TOKEN,
      access_token_secret=X_ACCESS_TOKEN_SECRET
    )
    return client
  except Exception as e:
    print(f"Error initializing Twitter client: {e}")
    return None

def publish_to_x():
  print("⚡ Checking Supabase for posts to publish on X (Twitter)...")
  
  try:
    res = supabase.table('content_calendar').select('*').order('scheduled_at').execute()
    all_posts = res.data or []
  except Exception as e:
    print(f"Supabase fetch error: {e}")
    all_posts = []

  # Find posts ready for X
  due_x_posts = [
    p for p in all_posts 
    if str(p.get('platform', '')).lower() in ['x', 'twitter', 'linkedin'] and p.get('status') in ['scheduled', 'draft']
  ]

  # If no scheduled X post found in Supabase, insert a live test post
  if not due_x_posts:
    print("No draft/scheduled post found in Supabase. Creating a live post entry for X...")
    new_post_data = {
      'title': 'Automated Post via SocialSync AI & CrewAI',
      'caption': f'⚡ Testing Automated Social Media Content Calendar Publishing via SocialSync AI & CrewAI! 🚀 #{datetime.now().strftime("%H%M")}',
      'platform': 'twitter',
      'scheduled_at': datetime.now().isoformat(),
      'status': 'scheduled',
      'color': '#06b6d4'
    }
    try:
      ins = supabase.table('content_calendar').insert([new_post_data]).execute()
      if ins.data:
        due_x_posts = ins.data
    except Exception as err:
      print(f"Note creating post: {err}")
      due_x_posts = [new_post_data]

  print(f"Found {len(due_x_posts)} candidate post(s) to publish on X.")

  twitter_client = get_twitter_client()

  if not twitter_client:
    print("\n⚠️ Twitter API Keys not found or incomplete in agent/.env!")
    return

  for post in due_x_posts:
    post_id = post.get('id')
    caption = post.get('caption') or post.get('title')

    print(f"\n🚀 Attempting Live Tweet Publish to X (ID: {post_id})...")
    print(f"Content: \"{caption}\"")

    try:
      # Execute live Tweet creation via Twitter API v2
      response = twitter_client.create_tweet(text=caption)
      tweet_id = response.data.get('id')
      print(f"✅ SUCCESS! Tweet published to X! Tweet ID: {tweet_id}")
      print(f"🔗 View Tweet: https://x.com/user/status/{tweet_id}")

      # Update status in Supabase
      if post_id:
        supabase.table('content_calendar').update({
          'status': 'published',
          'updated_at': datetime.now().isoformat()
        }).eq('id', post_id).execute()
        print(f"✅ Updated post status to 'published' in Supabase database!")
      break

    except Exception as err:
      print(f"❌ X API Posting Response/Error: {err}")

if __name__ == '__main__':
  publish_to_x()
