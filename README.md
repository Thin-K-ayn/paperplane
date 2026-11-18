# Paperplane

A calmer Slack web experience: Telegram-inspired message bubbles, a simpler sidebar, and local containers with one level of subcontainers.

**Publisher:** Thin-K-ayn · **Version:** 0.5.0 beta

[Privacy policy](https://thin-k-ayn.github.io/paperplane/privacy.html) · [Support](mailto:windlyen@gmail.com)

## Installation

The unlisted Chrome Web Store release is being prepared. A store installation link will be added after approval.

For local development or a manual trial:
1. Download this repository and extract it.
2. Open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and choose the `extension` folder.
3. Open Slack at `https://app.slack.com/client/` and refresh existing Slack tabs.

Company Chrome policies may restrict installation. This works in Chrome's Slack web app, not the Slack desktop or mobile apps.

## Features

- Rounded message bubbles and automatically right-aligned own messages when the rendered profile identifies your account. **Set my messages** is a fallback.
- **Telegram style / Original Slack** toggle, also available in the extension popup.
- Containers and one level of subcontainers, with automatic heading sizes, custom icons and colors.
- Local pins, editable names, moves, and removal without leaving or deleting Slack channels.
- Unread bubbles count distinct unread chats, not individual messages. Muted chats are excluded and sort below unmuted chats within the same pin group.

Choose **Containers** above the sidebar, then **+ New**. Use **+** to add chats and **…** to manage items. A container can copy the conversations currently rendered in a native Slack section. This is not automatic team-wide organization.

## Privacy and storage

Paperplane has no backend, analytics, or telemetry. It uses rendered Slack metadata and Chrome local extension storage. It does not store message bodies, access Slack tokens, or call Slack APIs. Read the [privacy policy](docs/privacy.html) for local data handling, permissions, retention, and support details.

Settings are local to the Chrome profile and workspace. They do not sync to teammates or other devices. Switching off preserves them; uninstalling removes extension storage.

**Existing unpacked users:** a Chrome Web Store installation has a different extension ID and separate storage. Keep the unpacked extension installed until your organization has been migrated or recreated. Do not run both copies together. This release does not include import/export or automatic migration.

## Development and checks

No dependency installation or build step is needed to run the extension.

```sh
node --test tests/package.test.cjs tests/containers.test.cjs
python -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/preview/tests.html` and click **Run checks** for the real DOM regression suite. The preview uses fictional conversations and a local storage adapter; it never sends Slack messages. `preview/index.html?store-demo` shows the store screenshot fixture.

Package the release with `python scripts/package.py`. Only the explicitly listed runtime assets enter the upload ZIP. Publishing instructions and listing copy are in [store/RELEASE.md](store/RELEASE.md).

## Known limitations

Slack can change its DOM without notice. Unknown markup retains its native behavior. A continuation message without an identifiable rendered author may stay left until sender metadata is available. Unread and mute state is learned from rendered sidebar rows, so changes to unrendered rows are detected when Slack renders them again. Simultaneous organization edits across tabs use the last saved version.

The 0.4.5 automatic-alignment change passed synthetic browser checks; a new live send has not yet been observed after reload. File uploads, all workspace variants, and exhaustive long-history behavior have not been tested. Use Original Slack if anything clips or behaves unexpectedly.

Independent project. Not affiliated with or endorsed by Slack or Telegram. Product names belong to their respective owners.
