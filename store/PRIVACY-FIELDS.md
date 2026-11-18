# Dashboard privacy fields

## Single purpose

Customize the visual layout and personal navigation of Slack's web app with message bubbles and locally organized sidebar containers.

## storage permission justification

Save the user's layout toggle, fallback member ID, and per-workspace container organization (names, conversation IDs, icons, colors, parent relationships, pins, collapse state, and selected sidebar view) in chrome.storage.local. No Chrome Sync or developer server is used.

## Slack site access justification

Content scripts match only https://app.slack.com/client/*. This access is needed to apply layout CSS, identify the signed-in user and message senders from rendered metadata, and read native sidebar conversation names/IDs plus unread/mute states for local navigation. No unrelated sites, cookies, credentials, or browsing-history APIs are accessed.

## Remote code

No, I am not using remote code. All JavaScript and styles are included in the extension package. There are no eval calls, remote script imports, or executable server responses.

## Data-use disclosures

Do NOT select a blanket "no user data handled" statement. Google requires local handling to be disclosed too. Use the current dashboard definitions and the following audited scope:

- Personally identifiable information: member IDs and channel/contact names, processed locally; manually selected member ID and shortcut names/IDs can be saved locally.
- Personal communications: sender and conversation metadata, unread/mute status, grouping/timestamps, used locally to present the chat interface. Message bodies and attachments are not copied or stored.
- Website content: rendered Slack sidebar/profile/message metadata and user-created container labels. Saved organization remains local.
- Web history: limited to the current Slack workspace/conversation URL needed to scope settings and select/navigate the current chat; no general browser history or browsing log is collected. Disclose this narrow URL access under Web history if the dashboard defines it to include current page URLs.
- No health, financial/payment, authentication, location, or general user-activity tracking data is collected.

Certifications supported by the implementation: no sale or transfer to third parties; no use unrelated to the stated single purpose; no creditworthiness or lending use. Review and certify these statements in the publishing account.

Privacy policy URL: https://thin-k-ayn.github.io/paperplane/privacy.html

Official references checked November 18, 2026:
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
