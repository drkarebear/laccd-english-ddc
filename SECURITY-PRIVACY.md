# Security and Privacy Maintenance

This repository is intentionally privacy-light and moderation-first.

## Public site

- No site analytics, ad trackers, cookies, localStorage, or sessionStorage.
- No remote web fonts. Use system/local fallback font stacks only.
- Every public page uses `<meta name="referrer" content="no-referrer">`.
- The optional Google Maps JavaScript API enhancement has been removed; the illustrated map works locally and Google Maps is only reached after a user follows a link.
- Keep public links HTTPS-only.

## Dynamic feeds

- Events, Faculty Commons, and Teaching Commons are read-only Apps Script feeds.
- There is no public `doPost()` write endpoint.
- Only approved, explicitly allowlisted fields are returned.
- JSONP callbacks are restricted to the one callback name expected by each page.
- Client JavaScript accepts feed URLs only from `https://script.google.com/macros/s/.../exec`.
- Render submitted content with `textContent`/DOM text nodes, never `innerHTML`.

## Moderation

- Nothing auto-publishes. Require `Approved = Yes`.
- Never act on a Faculty Commons change/removal request solely from the request form. Compare the request to the original private verification email; confirm substantial or mismatched requests using the original address.
- Follow the retention practices documented in `privacy.html` and each setup guide.

## Google Forms

- Email collection by Google Forms is disabled; verification addresses are ordinary form fields kept in private Sheets.
- Publishing of response summaries is explicitly disabled.
- Response editing is explicitly disabled.
- Forms do not require sign-in unless a future maintainer deliberately changes that choice.

## Release checks

Before publishing a new build:

1. Search for secrets/API keys and unexpected third-party scripts.
2. Confirm there are no analytics/tracking libraries.
3. Confirm all external active-content dependencies are intentional.
4. Confirm all public-feed renderers still use text nodes rather than raw HTML.
5. Confirm Apps Script feeds return only approved public fields.
6. Confirm `privacy.html` still describes the actual data flow.
7. Re-run local-link, duplicate-ID, JS syntax, accessibility, and privacy checks.
