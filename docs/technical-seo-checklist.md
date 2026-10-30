# Technical SEO checklist

## Implemented in repository

- [x] Unique title, description, canonical, Open Graph URL and image for each new static page and homepage.
- [x] One H1 per generated page; direct crawlable links between important pages.
- [x] Literal HTML price values: RM140, RM400 and RM1,000; accurate approximate per-session calculation for RM400 / 3.
- [x] Root `robots.txt` allows ordinary crawling and explicitly allows `OAI-SearchBot`.
- [x] `sitemap.xml` lists only the nine intended canonical URLs.
- [x] JSON-LD for WebSite, Organization, Person and WebPage on home; WebPage/BreadcrumbList and relevant Service on generated pages. No fake address, reviews, ratings or registration.
- [x] No clinical articles or unsupported condition landing pages generated.

## Verify after approved deployment

- [ ] Request all nine URLs plus `/robots.txt` and `/sitemap.xml`; check HTTP 200 and correct `text/html`, `text/plain` or XML types.
- [ ] Confirm HTTPS, preferred host and trailing-slash redirects lead to one canonical URL; check CNAME/hosting configuration.
- [ ] Run [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/) against live URLs. General schema may be valid without a Google rich-result type.
- [ ] Inspect each URL in Search Console; confirm pages are indexable and sitemap accepted.
- [ ] Run mobile and desktop Lighthouse/PageSpeed and record actual LCP, INP, CLS and test date; optimize only measured bottlenecks.
- [ ] Check rendered mobile widths, link taps, focus navigation and contrast in real browsers.
- [ ] Confirm WhatsApp links open the correct number and message on mobile, and the floating Qlynk widget does not cover the contact CTA.
- [ ] Review image dimensions/compression and third-party font/widget impact using performance traces.

Google says structured data must match visible content, be accessible to crawlers and be [validated](https://developers.google.com/search/docs/appearance/structured-data/local-business). It does not guarantee a rich result. We intentionally did not use LocalBusiness markup with a fictional street address.
