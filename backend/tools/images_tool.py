import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import quote
import asyncio
from playwright.async_api import async_playwright
import re
import random
from langchain.tools import Tool

# ===============================
# Utility Function
# ===============================

def upgrade_pinterest_image_url(url: str) -> str:
    return re.sub(r"/\d+x(?:\d+)?/", "/originals/", url)

# ===============================
# DeviantArt Image Scraper (Fallback)
# ===============================

async def get_deviantart_images(query: str, limit=10):
    search_url = f"https://www.deviantart.com/search?q={quote(query)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    results = []

    async with aiohttp.ClientSession() as session:
        async with session.get(search_url, headers=headers) as resp:
            html = await resp.text()

    soup = BeautifulSoup(html, "html.parser")

    for anchor in soup.find_all("a", href=True):
        img = anchor.find("img")
        if img and img.has_attr("property") and img["property"] == "contentUrl":
            srcset = img.get("srcset", "")
            alt = img.get("alt", "No description").strip()
            results.append({
                "source": "DeviantArt",
                "url": srcset,
                "description": alt,
                "page": anchor["href"]
            })
        if len(results) >= limit:
            break

    return results

# ===============================
# Pinterest Image Scraper (Primary)
# ===============================

async def get_pinterest_images(query: str, limit=10):
    images = []
    query = query.replace(" ", "%20")
    url = f"https://www.pinterest.com/search/pins/?q={query}"

    print("Reached Pinterest scraper")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            await page.goto(url, timeout=60000)

            # Scroll to load more content
            for _ in range(5):
                await page.mouse.wheel(0, 10000)
                await asyncio.sleep(1)

            # Collect all image elements
            elements = await page.query_selector_all("img")
            for el in elements:
                src = await el.get_attribute("src")
                alt = await el.get_attribute("alt")
                if src and src.startswith("http"):
                    src = upgrade_pinterest_image_url(src)
                    images.append({
                        "source": "Pinterest",
                        "url": src,
                        "description": alt or "No description"
                    })

        except Exception as e:
            print(f"[Pinterest] Failed: {e}")
        finally:
            await browser.close()

    random.shuffle(images)
    final_images = images[:limit]
    print(f"Pinterest found {len(final_images)} images")
    return final_images

# ===============================
# Master Function with Fallback
# ===============================

async def get_images(query: str, source = "pinterest",limit=20):
    if source == "pinterest":
        images = await get_pinterest_images(query, limit)
        if not images:
            print("Pinterest returned no results. Falling back to DeviantArt.")
            images = await get_deviantart_images(query, limit)
        return images

    elif source == "deviantart":
        return await get_deviantart_images(query, limit)

    else:
        raise ValueError("Only 'pinterest' and 'deviantart' are supported in this fallback test.")


#? Step 4: LangChain Tool
ImageSearch = Tool(
    name="ImageSearch",
    func=get_images,
    description="Search the web and return 3–4 links with metadata and visible content"
)

