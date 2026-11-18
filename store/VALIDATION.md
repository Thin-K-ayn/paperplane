# Release validation — November 18, 2026

- 11 Node checks passed (container model, permissions, package references, popup rollback, icon dimensions, version and privacy consistency).
- 95 synthetic browser checks passed against the actual content scripts and styles.
- Upload ZIP: 14 allowlisted runtime files, each byte-verified against the extension folder. No private screenshots, historical verification notes, test fixtures, workspace data, or credentials are included.
- Two store screenshots were captured from the actual extension running on a fictional Slack fixture, each 1280 × 800. The 128 × 128 store icon has transparent padding.
- Runtime permissions remain storage plus content-script injection only on Slack client pages. No new network service or remote code.
- Live integration has prior acceptance through 0.4.4. The 0.4.5 automatic-profile/pre-paint alignment change has synthetic coverage; a newly sent live Slack message after reload has not been observed. Perform this final smoke check before store submission.
- Google review and the approved unlisted installation URL are still pending.
