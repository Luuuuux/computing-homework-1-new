import feedparser
import json
from datetime import datetime
from urllib.parse import quote_plus

# ==============================
# Configuration
# ==============================

SEARCH_QUERY = "machine learning"
MAX_RESULTS = 5

encoded_query = quote_plus(SEARCH_QUERY)

ARXIV_API = (
    "http://export.arxiv.org/api/query?"
    f"search_query=all:{encoded_query}"
    f"&start=0&max_results={MAX_RESULTS}"
    "&sortBy=submittedDate&sortOrder=descending"
)

OUTPUT_PATH = "arxiv/data.json"

# ==============================
# Fetch Data
# ==============================

print("Fetching arXiv data...")

feed = feedparser.parse(ARXIV_API)

papers = []

for entry in feed.entries:

    # Extract PDF link safely
    pdf_url = None
    for link in entry.links:
        if link.type == "application/pdf":
            pdf_url = link.href

    paper = {
        "title": entry.title.strip(),
        "authors": [author.name for author in entry.authors],
        "abstract": entry.summary.strip(),
        "pdf_url": pdf_url,
        "published": entry.published,
        "fetched_at": datetime.utcnow().isoformat()
    }

    papers.append(paper)

# ==============================
# Write JSON
# ==============================

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(papers, f, indent=2, ensure_ascii=False)

print(f"Saved {len(papers)} papers to {OUTPUT_PATH}")
