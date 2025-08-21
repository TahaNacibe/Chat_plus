import requests
from bs4 import BeautifulSoup

def get_link_metadata(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        def get_meta(name, attr='content'):
            tag = soup.find("meta", property=name) or soup.find("meta", attrs={"name": name})
            return tag.get(attr) if tag else None

        return {
            "url": url,
            "title": soup.title.string.strip() if soup.title and soup.title.string else None,
            "description": get_meta("og:description") or get_meta("description"),
            "image": get_meta("og:image"),
        }

    except Exception as e:
        return {
            "url": url,
            "error": str(e)
        }

def get_all_urls_metadata(urls):
    results = [get_link_metadata(url) for url in urls]

    # Check if at least one link succeeded
    any_success = any("error" not in result for result in results)

    return {
        "status": "success" if any_success else "failed",
        "message": results
    }
