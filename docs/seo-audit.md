# Baseline SEO audit — 30 October 2026

## Scope and method

Repository inspection covered the public root `index.html`, images, favicon, CNAME and the separate `admin/` application. The public site was a single static HTML page. The web retrieval tool could not fetch `https://eissya.site/`, but a direct HTTP request succeeded. At the time of this audit, production returned HTTP 200 for `/`, HTTP 404 for `/robots.txt` and `/sitemap.xml`, and HTTP 200 for `/admin/`. The admin HTML includes `noindex, nofollow`. Direct redirect checks showed `http://eissya.site/` and `https://www.eissya.site/` each redirected once to `https://eissya.site/`. This is a bounded URL sample, not a full crawl or Search Console index report.

## Baseline findings

| Area | Before implementation | Action |
| --- | --- | --- |
| Architecture | One public page with section anchors; no dedicated stroke, older adult, pricing or service landing pages. | Created eight static, crawlable pages with distinct intent. |
| Metadata | Homepage title only; no description, canonical, Open Graph or JSON-LD. | Added metadata and truthful identity/service graphs. |
| Pricing | Initial HTML displayed `0` for all animated prices. Trial total showed RM400. | Final prices are now literal HTML values; RM400 retained per owner's correction. |
| Indexing | No root robots file or XML sitemap was present. | Added both. Deployment status must be checked. |
| Navigation | One-page anchors only, with no links to search entry pages. | Added crawlable links from homepage and shared page navigation. |
| Images | Portrait had meaningful alt text; no responsive variants. | New About portrait has alt and dimensions; responsive image work remains optional. |
| Motion and access | Scroll reveal CSS initially hid sections; price animation required JavaScript. Reduced-motion media query existed. | Content remains visible without intersection events; prices do not depend on JavaScript. |
| WhatsApp | Links used `60103890319` in inspected source. | Retained number and added a simple location prompt. Owner must verify number. |
| Medical/trust claims | Some copy promised response time, equipment and package benefits without source confirmation. | Removed the response-time statement; service and package wording still needs owner review. |

## Baseline risks not measurable from source alone

Production index coverage, broken external links, Google Business Profile presence, mobile field data, Lighthouse score and third-party chat widget impact remain unmeasured. The new pages, robots and sitemap exist locally only until an approved deployment. The admin app has its own deployment configuration and was outside the public SEO page set.
