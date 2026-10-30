"""Local Chromium checks. Run: python scripts/browser_smoke.py"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from functools import partial
from tempfile import gettempdir
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}"
slugs = ["", "home-physiotherapy-ipoh/", "stroke-rehabilitation-ipoh/", "elderly-physiotherapy-ipoh/", "about/", "pricing/", "how-home-physiotherapy-works/", "faq/", "contact/"]
try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for width in (390, 1280):
            page = browser.new_page(viewport={"width": width, "height": 844}, reduced_motion="reduce")
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            for slug in slugs:
                response = page.goto(base + "/" + slug, wait_until="domcontentloaded")
                assert response.status == 200, (slug, response.status)
                assert page.locator("h1").count() == 1, slug
                assert page.locator("a[href*='wa.me/60103890319']").count() >= 1, slug
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), (slug, width, "overflow")
                if slug == "":
                    if width == 390:
                        page.screenshot(path=str(Path(gettempdir()) / "eissya-home-mobile.png"), full_page=True)
                    assert page.get_by_text("RM", exact=True).count() == 3
                    assert page.locator(".count").all_text_contents() == ["140", "400", "1,000"]
                    page.get_by_role("button", name="How long is each session?").click()
                    assert page.get_by_role("button", name="How long is each session?").get_attribute("aria-expanded") == "true"
                if slug == "pricing/":
                    assert "RM400" in page.locator("body").inner_text()
                if slug == "stroke-rehabilitation-ipoh/" and width == 1280:
                    page.screenshot(path=str(Path(gettempdir()) / "eissya-stroke-desktop.png"), full_page=True)
            assert not errors, errors
            print(f"PASS: Chromium {width}px, {len(slugs)} pages, no page errors or horizontal overflow")
            page.close()
        browser.close()
finally:
    server.shutdown()
