"""Run against a local Vite server started with VITE_DEMO_MODE=true.

python scripts/renewal_smoke.py [url]
Requires Python Playwright and its Chromium browser.
"""
import sys
from pathlib import Path
from tempfile import gettempdir
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5179'
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width in (1280, 390):
        page = browser.new_page(viewport={'width': width, 'height': 844})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url)
        def search_client(name):
            if width == 390:
                page.get_by_role('button', name='Open menu').click()
            page.locator('nav button').filter(has_text='Clients').click()
            page.get_by_placeholder('Search clients…', exact=True).fill(name)
        search_client('Siti Hajar')
        page.get_by_role('button', name='Open Siti Hajar').click()
        page.get_by_role('button', name='Renew package', exact=True).click()
        expect(page.get_by_role('heading', name='Renew package')).to_be_visible()
        page.screenshot(path=str(Path(gettempdir()) / f'eissya-renewal-{width}.png'))
        page.get_by_role('button', name='Cancel', exact=True).click()
        expect(page.get_by_role('heading', name='Previous packages')).to_have_count(0)
        page.get_by_role('button', name='Renew package', exact=True).click()
        page.locator('.modal select').first.select_option('Single Session')
        page.get_by_label('Package price (RM)').fill('0')
        page.get_by_label('New package payment').select_option('paid')
        page.get_by_role('button', name='Renew package', exact=True).click()
        expect(page.get_by_role('heading', name='Previous packages')).to_be_visible()
        expect(page.locator('.package-history')).to_contain_text('Progress Pack')
        expect(page.locator('.package-history')).to_contain_text('RM 1,000')
        expect(page.locator('.package-detail')).to_contain_text('1 sessions left')
        expect(page.get_by_role('button', name='Renew package', exact=True)).to_have_count(0)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        records = page.evaluate("JSON.parse(localStorage.getItem('eissya-demo-clients'))")
        assert len(records) == 6
        patient = next(item for item in records if item['id'] == 'demo-6')
        assert patient['sessions_used'] == 0 and patient['package_price'] == 0
        assert patient['status'] == 'active' and patient['payment_status'] == 'paid'
        assert len(patient['package_history']) == 1
        assert patient['phone'] == '+60 13-998 7632'
        page.reload()
        search_client('Siti Hajar')
        page.get_by_role('button', name='Open Siti Hajar').click()
        expect(page.get_by_role('heading', name='Previous packages')).to_be_visible()
        page.get_by_role('button', name='Close', exact=True).click()
        search_client('')
        if width == 390:
            page.get_by_role('button', name='Open menu').click()
        page.get_by_role('button', name='Schedule', exact=False).first.click()
        page.locator('.schedule-card').filter(has_text='Siti Hajar').first.click()
        page.get_by_label('Clinical impression').fill('Renewal follow-up note')
        page.get_by_role('button', name='Session completed', exact=True).click()
        search_client('Siti Hajar')
        page.get_by_role('button', name='Open Siti Hajar').click()
        expect(page.locator('.payment-detail')).to_contain_text('Paid')
        page.get_by_role('button', name='Renew package', exact=True).click()
        page.locator('.modal select').first.select_option('Trial Pack')
        page.get_by_role('button', name='Renew package', exact=True).click()
        expect(page.locator('.package-history article')).to_have_count(2)
        expect(page.locator('.appointment-history')).to_contain_text('Renewal follow-up note')
        records = page.evaluate("JSON.parse(localStorage.getItem('eissya-demo-clients'))")
        patient = next(item for item in records if item['id'] == 'demo-6')
        assert patient['payment_status'] == 'pending' and patient['sessions_total'] == 3
        assert patient['sessions_used'] == 0 and len(records) == 6
        page.get_by_role('button', name='Close', exact=True).click()
        search_client('Nur Amira')
        page.get_by_role('button', name='Open Nur Amira').click()
        expect(page.get_by_role('button', name='Renew package', exact=True)).to_have_count(0)
        page.get_by_role('button', name='Mark package as paid').click()
        expect(page.get_by_role('button', name='Renew package', exact=True)).to_be_visible()
        assert not errors, errors
        print(f'PASS {width}px: cancel, renew, persistence, repeated renewal, SOAP history, payment guards, prepaid completion')
        page.close()
    browser.close()
