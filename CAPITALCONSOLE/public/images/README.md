# Capital Console image routes

No binary image placeholders are committed to this repository. Add the production artwork manually using these exact paths when it is ready:

- `/public/images/financial-freedom-banner.webp` — background image for the Financial Freedom dashboard banner.
- `/public/images/capital-console-logo-transparent.webp` — transparent Capital Console logo used by the desktop sidebar.

Both files will be served by Next.js from `/images/...` and are referenced through `next/image` in the frontend. Until the files exist, the UI uses CSS gradient/text fallbacks so the app continues to run without missing image assets in Git.
