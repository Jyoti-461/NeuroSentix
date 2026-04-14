import snscrape.modules.twitter as sntwitter
import re

# Extract Tweet ID from URL
def extract_tweet_id(url):
    match = re.search(r"status/(\\d+)", url)
    return match.group(1) if match else None


# Fetch replies using conversation_id
def fetch_replies(tweet_id, limit=30):
    query = f"conversation_id:{tweet_id}"
    replies = []

    for i, tweet in enumerate(
        sntwitter.TwitterSearchScraper(query).get_items()
    ):
        if i >= limit:
            break

        replies.append({
            "text": tweet.content,
            "date": tweet.date,
            "username": tweet.user.username
        })

    return replies