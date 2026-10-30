# Implementation report — 30 October 2026

## What changed

- Kept the existing homepage design and corrected crawler-visible pricing. All three totals now appear as literal HTML: **RM140**, **RM400** (three sessions, per the owner's correction) and **RM1,000** (eight sessions). The three-session average is shown as approximately RM133.33. The scroll-triggered price counter was removed; content reveal elements no longer start hidden.
- Added homepage description, canonical URL, social metadata, JSON-LD identity graph, clearer Ipoh positioning, internal links, a direct WhatsApp prompt and mobile navigation to the new pages.
- Generated eight static pages with unique titles, descriptions, canonicals, H1s, social metadata, JSON-LD and visible questions: `/home-physiotherapy-ipoh/`, `/stroke-rehabilitation-ipoh/`, `/elderly-physiotherapy-ipoh/`, `/about/`, `/pricing/`, `/how-home-physiotherapy-works/`, `/faq/` and `/contact/`.
- Added `robots.txt`, `sitemap.xml`, optional `llms.txt` and a shared stylesheet for the new pages. The sitemap contains the nine intended public URLs.
- Removed several unverified homepage promises about response time, equipment, between-visit support and priority scheduling. No reviews, registration claim, clinic address or treatment outcome was invented.

## Keyword and structured data map

| Page | Primary intent | Structured data |
| --- | --- | --- |
| `/` | Eissya Physio; home physiotherapy Ipoh | WebSite, Organization, Person, WebPage |
| `/home-physiotherapy-ipoh/` | Home visit physiotherapy Ipoh | WebPage, BreadcrumbList, Service |
| `/stroke-rehabilitation-ipoh/` | Home stroke physiotherapy Ipoh | WebPage, BreadcrumbList, Service |
| `/elderly-physiotherapy-ipoh/` | Elderly physiotherapy at home Ipoh | WebPage, BreadcrumbList, Service |
| `/pricing/` | Home physiotherapy cost Ipoh | WebPage, BreadcrumbList |
| `/about/` | Nur Siti Eissya background | WebPage, BreadcrumbList |
| `/how-home-physiotherapy-works/` | Visit process | WebPage, BreadcrumbList |
| `/faq/` | Pre-booking questions | WebPage, BreadcrumbList |
| `/contact/` | Contact and booking | WebPage, BreadcrumbList |

The schema avoids a fictional storefront address, reviews and unsupported professional status. It is syntactically parsed locally; live Rich Results Test and Schema.org validation remain for after deployment.

## Local SEO and AI search

The repository includes an owner-controlled service-area Business Profile guide, proposed description, honest-review request/response workflow and citation criteria. No third-party profile was created. `OAI-SearchBot` is allowed; the owner can make a separate GPTBot choice. Answer-first page copy and consistent identity support ordinary and AI search discovery without a ranking promise.

## Tests performed

- `python scripts/check_site.py`: **pass** for nine public pages, unique metadata, one H1 each, local links, WhatsApp target, JSON-LD parsing, HTML prices, sitemap parity and robots declarations.
- `python scripts/browser_smoke.py`: **pass** in local Chromium at 390 px and 1280 px. All nine pages returned 200 from the local server, had one H1 and a WhatsApp link, showed no horizontal overflow or page errors; the home FAQ opened and the price values remained visible.
- Visual inspection of mobile homepage and desktop stroke page screenshots: design and layout appeared coherent. This is a visual spot check, not a formal accessibility or performance audit.
- Live baseline requests before deployment: homepage 200; `robots.txt` and `sitemap.xml` 404; `/admin/` 200 with `noindex`; HTTP and www each redirected once to HTTPS apex.

No live deployment, Google Rich Results Test, Schema.org Validator, Search Console, PageSpeed Insights, Lighthouse or real-user Core Web Vitals test was completed. No performance score, search ranking, review rating or traffic estimate is claimed.

## Owner review and account access needed

1. Eissya must clinically review and approve stroke and older-adult copy, FAQs and all service descriptions before publication. Confirm degree wording, prior employment dates, language levels, phone number, current session length, package inclusions, insurance wording and transport policy.
2. Verify the professional registration and practising status required for the service with the appropriate authority; the site makes no MAHPC or APC claim. Resolve any legal/professional compliance question before publishing new healthcare claims.
3. Approve a production deployment separately. Then test live URLs, sitemap, redirects, structured data, mobile rendering and performance.
4. The owner must create and verify the Google Business Profile and Search Console property. GA4 and click tracking require access and a privacy/consent decision. Genuine review links and patient consent are needed before publishing reviews or photos.

## Next 30 / 60 / 90 days

**30 days:** complete clinical/fact review; approve deployment; verify live sitemap and key URLs; create and verify service-area Business Profile; set up Search Console. **60 days:** request honest reviews without incentives, review search queries and enquiry quality, and refine pages with measured evidence. **90 days:** publish two clinically reviewed articles, decide if separate condition pages are justified, and assess real Core Web Vitals and booking conversion.
