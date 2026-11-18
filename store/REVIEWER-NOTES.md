# Reviewer test instructions

Paperplane is a local appearance extension for Slack's web app. It has no separate service or account and does not call Slack APIs.

1. Install the submitted extension and sign in to a Slack workspace you are authorized to use at https://app.slack.com/client/.
2. Refresh Slack. Inspect message bubbles, sender alignment, and the Telegram style / Original Slack toggle at the lower left. Profile detection may hide Set my messages; when profile metadata is unavailable, that control lets you choose your sender name.
3. Choose Containers above the native sidebar, create a root container, and use + to create one subcontainer and add a rendered channel.
4. Use the three-dot menu to change icon/color, pin/unpin, rename, or move an item. Refresh and confirm the organization persists.
5. Observe unread and muted channels already available in your test workspace. Counts represent unread chats, exclude muted chats, and propagate through nested containers. Muted chats sort after unmuted chats within pin groups.
6. Switch to Original Slack. Confirm native navigation/layout return and drafts are preserved. Switch back to restore saved containers.
7. Open the extension popup to access the layout toggle, privacy policy, and support contact.

No payment or extra permissions beyond storage and Slack client page access are needed. No company Slack credentials are included. If the reviewer requests dedicated test access, arrange an isolated test workspace with fictional data; do not provide production account credentials.

The public source contains a synthetic fixture and 95 browser regression checks. It exercises the actual extension scripts but does not substitute for Slack integration review. See README.md to run it locally.
