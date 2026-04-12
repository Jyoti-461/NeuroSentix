import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io
from wordcloud import WordCloud
from app.config.db import collection  # ← was missing

_cached_image: bytes | None = None   # cache as bytes, not BytesIO

def get_wordcloud_image() -> io.BytesIO:
    global _cached_image

    if _cached_image:
        return io.BytesIO(_cached_image)  # fresh buffer each time

    data = list(collection.find({}, {"_id": 0}))
    text_data = " ".join([item.get("text", "") for item in data]) or "No Data"

    wc = WordCloud(width=800, height=400, background_color="white").generate(text_data)

    buf = io.BytesIO()
    fig, ax = plt.subplots()
    ax.imshow(wc, interpolation="bilinear")
    ax.axis("off")
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)

    _cached_image = buf.read()      # cache as bytes
    return io.BytesIO(_cached_image)