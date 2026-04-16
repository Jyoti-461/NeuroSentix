import re

# Extract Tweet ID from URL
def extract_tweet_id(url):
    match = re.search(r"(?:twitter|x)\.com/.+/status/(\d+)", url)
    return match.group(1) if match else None


# Fetch replies — snscrape is broken since Twitter/X locked their API in 2023
def fetch_replies(tweet_id, limit=30):
    raise NotImplementedError(
        "Twitter reply scraping is currently unavailable. "
        "X (Twitter) blocked third-party access in 2023. "
        "A paid Twitter API v2 key is required to fetch replies."
    )
