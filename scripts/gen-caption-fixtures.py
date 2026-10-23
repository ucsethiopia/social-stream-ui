"""Regenerate lib/captions/__fixtures__/publisher-parity.json from the real backend publishers.

Usage (from this repo's root, with the backend checked out next to it):
    python3 scripts/gen-caption-fixtures.py > lib/captions/__fixtures__/publisher-parity.json

Needs the backend's Python deps (httpx, pydantic). Override the backend path with SOCIAL_STREAM_DIR.
"""
import json
import os
import sys
from datetime import date
from pathlib import Path

BACKEND = Path(os.environ.get("SOCIAL_STREAM_DIR", Path(__file__).resolve().parents[2] / "social-stream"))
sys.path.insert(0, str(BACKEND))
from app.publishers.types import NewsPost
from app.publishers import telegram, instagram, facebook, linkedin

long_body = ("Ethiopia's economy is entering a new phase of reform. " * 40).strip()
emoji_body = ("Growth 📈 and reform 🇪🇹 in focus. " * 60).strip()
cases = [
  dict(name="short_with_image", title="Q3 Economic Outlook", subtitle="What the reforms mean for banks", body="A short body.", tags=["Research", "highlight"], images=["https://x/a.jpg"]),
  dict(name="short_text_only", title="Q3 Economic Outlook", subtitle="", body="A short body.", tags=["Research"], images=[]),
  dict(name="long_with_image_trims_body", title="Long read", subtitle="Subtitle here", body=long_body, tags=["Research", "UCSEthiopia", "Economy"], images=["https://x/a.jpg", "https://x/b.jpg"]),
  dict(name="long_text_only", title="Long read", subtitle="Sub", body=long_body * 3, tags=[], images=[]),
  dict(name="emoji_body", title="Growth 📈", subtitle="🇪🇹", body=emoji_body, tags=["Economy"], images=["https://x/a.jpg"]),
  dict(name="no_title", title="", subtitle="Only subtitle", body="Body", tags=["x"], images=[]),
  dict(name="no_title_no_subtitle", title="", subtitle="", body="Body only", tags=[], images=[]),
  dict(name="huge_title", title="T" * 1100, subtitle="S", body="B", tags=["a"], images=["https://x/a.jpg"]),
  dict(name="hash_prefixed_tag", title="Tags", subtitle="s", body="b", tags=["#Already", "Plain"], images=[]),
]
out = []
for c in cases:
    p = NewsPost(id=1, title=c["title"], subtitle=c["subtitle"] or None, date=date(2026,10,23), tags=c["tags"], team=None, body=c["body"], main_image=(c["images"][0] if c["images"] else None), extra_images=c["images"][1:])
    max_len = telegram._MAX_MESSAGE if not c["images"] else telegram._MAX_CAPTION
    out.append({**c, "expected": {
        "telegram": telegram._build_text(p, max_len=max_len),
        "instagram": instagram._build_instagram_caption(p),
        "facebook": facebook._build_caption(p),
        "linkedin": linkedin._build_commentary(p),
    }})
print(json.dumps(out, ensure_ascii=False, indent=1))
