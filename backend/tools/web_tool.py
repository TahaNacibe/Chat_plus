from langchain.tools import Tool
import asyncio
import aiohttp
from urllib.parse import quote, urlparse
from bs4 import BeautifulSoup
from difflib import SequenceMatcher
from playwright.async_api import async_playwright
from ddgs import DDGS
import os


def is_similar(a: str, b: str, threshold: float = 0.9) -> bool:
    return SequenceMatcher(None, a.strip().lower(), b.strip().lower()).ratio() > threshold

#? Utility
def extract_site_name(url: str):
    return urlparse(url).netloc.replace("www.", "")

#? Google Custom Search API: content
async def google_api_search(query: str, mode="content", limit=5):
    #? key and cx
    key = os.environ.get('GOOGLE_API_KEY', 'default_value')
    cx = os.environ.get('GOOGLE_CX_ID', 'default_value')
    
    base = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": key,
        "cx": cx,
        "q": query,
        "num": min(limit, 10),
        "safe": "active",
    }
    if mode == "image":
        params["searchType"] = "image"

    async with aiohttp.ClientSession() as session:
        async with session.get(base, params=params) as resp:
            if resp.status != 200:
                raise Exception(f"Google API failed: {resp.status}")
            data = await resp.json()
            return data.get("items", [])

#? Scrape metadata + main image from a web page
async def scrape_page_metadata(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=15000)
        await page.wait_for_timeout(2000)
        content = await page.content()
        soup = BeautifulSoup(content, "html.parser")

        # Title
        title = soup.title.text.strip() if soup.title else "No title"

        # Image extraction
        image = None
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            image = og_image["content"]
        else:
            img_tag = soup.find("img")
            if img_tag and img_tag.get("src", "").startswith("http"):
                image = img_tag["src"]

        # Site name
        og_site = soup.find("meta", property="og:site_name")
        site_name = og_site["content"] if og_site and og_site.get("content") else extract_site_name(url)

        # Extract all <p>, <li>, and headers
        text_parts = []
        for tag in soup.find_all(["p", "li", "h1", "h2", "h3", "h4"]):
            text = tag.get_text(strip=True)
            if len(text) > 40:
                text_parts.append(text)

        # Join all readable parts
        full_text = "\n\n".join(text_parts)

        await browser.close()
        return {
            "link": url,
            "title": title,
            "site_name": site_name,
            "image": image or "",
            "content": full_text.strip() or "No readable content found."
        }



#? Scrape fallback using Playwright for content mode
async def fallback_scrape_search(query: str, limit=5):
    from urllib.parse import urljoin

    async with async_playwright() as p:
        results = DDGS().text(query, max_results=5)
        urls = []
        for a in results:
            href = a["href"]

            if href and href.startswith("http"):
                urls.append(href)
            elif href:
                urls.append(urljoin("https://duckduckgo.com", href))  # fallback for relative

            if len(urls) >= limit:
                break

        print(f"[DuckDuckGo fallback URLs] → {urls}")
        return urls

#? Scrape fallback for images
async def fallback_scrape_images(query: str, limit=5):
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(f"https://duckduckgo.com/?q={quote(query)}&iax=images&ia=images")
        await page.wait_for_timeout(2000)

        await page.mouse.wheel(0, 3000)
        await page.wait_for_timeout(1500)

        imgs = await page.query_selector_all("img")
        for img in imgs:
            src = await img.get_attribute("data-src") or await img.get_attribute("src")
            if src and src.startswith("http"):
                results.append(src)
            if len(results) >= limit:
                break
        await browser.close()
    return results

#* Master Search Function
async def smart_search_web(query: str, mode="content", limit=5):
    try:
        items = await google_api_search(query, mode=mode, limit=limit)
        if mode == "image":
            return [item["link"] for item in items]
        else:
            # Scrape full metadata from each result
            results = []
            seen_contents = []

        for item in items:
            try:
                meta = await scrape_page_metadata(item["link"])

                # Skip empty or weak pages
                if not meta["title"] or meta["title"] == "No title":
                    continue
                if not meta["content"] or len(meta["content"]) < 100:
                    continue
                if any(domain in meta["link"] for domain in ["reddit.com", "twitter.com", "facebook.com"]):
                    continue

                # Fuzzy duplicate content check
                if any(is_similar(meta["content"], previous) for previous in seen_contents):
                    continue
                seen_contents.append(meta["content"])

                results.append(meta)

            except Exception:
                continue
            return results

    except Exception as e:
        print(f"[Google API failed] Reason: {e}")
        # Fallback
        if mode == "image":
            return await fallback_scrape_images(query, limit)
        else:
            return await fallback_scrape_search(query, limit)



#? Step 4: LangChain Tool
WebSearch = Tool(
    name="WebSearch",
    func=smart_search_web,
    description="Search the web and return 3–4 links with metadata and visible content"
)
