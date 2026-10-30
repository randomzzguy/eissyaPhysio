"""Static checks for the public site. Run: python scripts/check_site.py"""
from pathlib import Path
from urllib.parse import urlparse
import json
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
pages = [root / "index.html", *sorted(p for p in root.glob("*/index.html") if p.parent.name != "admin")]
assert len(pages) == 9, f"Expected 9 public pages, found {len(pages)}"
titles = set()
descriptions = set()
canonicals = set()
for path in pages:
    html = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.get_text(strip=True)
    description = soup.find("meta", attrs={"name": "description"})["content"]
    canonical = soup.find("link", rel="canonical")["href"]
    assert title not in titles and description not in descriptions and canonical not in canonicals, path
    titles.add(title); descriptions.add(description); canonicals.add(canonical)
    assert len(soup.find_all("h1")) == 1, path
    assert soup.find("meta", attrs={"name": "robots", "content": "noindex"}) is None, path
    assert canonical == "https://eissya.site/" + ("" if path == root / "index.html" else path.parent.name + "/"), path
    assert soup.find("meta", property="og:image"), path
    for item in soup.find_all("script", type="application/ld+json"):
        assert json.loads(item.string)["@context"] == "https://schema.org", path
    for link in soup.find_all("a", href=True):
        href = link["href"]
        if href.startswith("/") and not href.startswith("//"):
            target = (root / href.lstrip("/"))
            assert (target / "index.html").is_file() if href.endswith("/") else target.is_file(), (path, href)
        if "wa.me/" in href:
            assert urlparse(href).path == "/60103890319", (path, href)
    for image in soup.find_all("img"):
        assert image.has_attr("alt"), (path, image)

home = (root / "index.html").read_text(encoding="utf-8")
assert 'class="count">140</span>' in home
assert 'class="count">400</span>' in home
assert 'class="count">1,000</span>' in home
assert 'data-target=' not in home
pricing = (root / "pricing" / "index.html").read_text(encoding="utf-8")
assert all(value in pricing for value in ("RM140", "RM400", "RM1,000", "RM133.33"))
tree = ET.parse(root / "sitemap.xml")
urls = {node.text for node in tree.findall(".//{*}loc")}
assert urls == canonicals, (urls, canonicals)
robots = (root / "robots.txt").read_text(encoding="utf-8")
assert "OAI-SearchBot" in robots and "Sitemap: https://eissya.site/sitemap.xml" in robots
print(f"PASS: {len(pages)} public pages, unique metadata, links, JSON-LD, prices, sitemap and robots")
