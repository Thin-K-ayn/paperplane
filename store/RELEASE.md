# Paperplane 0.5.0 — unlisted release

Publisher: Thin-K-ayn · support: windlyen@gmail.com

## Upload materials

- `paperplane-0.5.0.zip`: extension ZIP, manifest at the archive root.
- `LISTING.md`: title, descriptions, URLs, and artwork instructions.
- `PRIVACY-FIELDS.md`: permission and local-data disclosures.
- `REVIEWER-NOTES.md`: reviewer instructions.
- `assets/`: icon and synthetic screenshots.
- `../docs/`: public homepage and privacy policy for GitHub Pages.

## Publish

1. Sign in to the Chrome Web Store Developer Dashboard with the intended publishing account. Complete developer registration, any applicable registration fee, and account verification personally if required.
2. Add a new item and upload the ZIP. Fill the listing and privacy tabs using the files above.
3. Set Distribution → Visibility to **Unlisted**. Anyone with the eventual store URL can install it; unlisted does not restrict access to teammates.
4. Set the public privacy URL to https://thin-k-ayn.github.io/paperplane/privacy.html and verify it opens without sign-in.
5. Complete a live smoke check of the new automatic account detection and newly sent message alignment before submitting. No live test message has been sent by the agent.
6. Submit for review. Do not promise an approval date. Once published, use the actual Chrome Web Store listing URL as the team installation link; the GitHub repository URL is not a one-click extension install link.
7. Add that approved store URL to the homepage and README. Future releases need a higher manifest version; Chrome distributes store updates, and already-open Slack tabs may need refreshing.

## Existing unpacked installation

Do not remove it before migration. The store extension has separate storage. Disable the unpacked copy before enabling the store copy, and keep it installed until containers have been recreated or a separate migration has been completed. Do not run both simultaneously. This release adds no import/export feature.

## Sources

- https://developer.chrome.com/docs/webstore/publish
- https://developer.chrome.com/docs/webstore/images
- https://developer.chrome.com/docs/webstore/cws-dashboard-distribution
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
