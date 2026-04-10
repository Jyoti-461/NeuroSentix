from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

def get_analyzer():
    try:
        return SentimentIntensityAnalyzer()
    except LookupError:
        nltk.download('vader_lexicon')
        return SentimentIntensityAnalyzer()

sia = get_analyzer()

def analyze_sentiment(text: str):
    score = sia.polarity_scores(text)

    compound = score['compound']

    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return {
        "sentiment": sentiment,
        "score": compound
    }