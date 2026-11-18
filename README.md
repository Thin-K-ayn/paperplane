# Paperplane

**English** | [简体中文](README.zh-CN.md)

A calmer Slack web experience: Telegram-inspired message bubbles, a simpler sidebar, and local containers with one level of subcontainers.

**Publisher:** Thin-K-ayn · **Version:** 0.5.0 beta

[Privacy policy](https://thin-k-ayn.github.io/paperplane/privacy.html) · [Support](mailto:windlyen@gmail.com)

## Install Paperplane (free, about 2 minutes)

Paperplane is currently shared through this repository. Chrome Web Store publishing is on hold. You do not need a developer account, payment, Git, or any build tools.

Use **Google Chrome on a computer** and open Slack in that browser. Paperplane does not work in Slack's desktop or mobile apps.

1. [Download the latest source ZIP](https://github.com/Thin-K-ayn/paperplane/archive/refs/heads/main.zip), or click **Code → Download ZIP** on this repository.
2. Extract the ZIP into a permanent location, such as `Documents/Paperplane`. Keep the extracted files there: Chrome loads them directly from disk.
3. In the **same Chrome profile you use for Slack**, type `chrome://extensions` into the address bar and press Enter.
4. Turn on **Developer mode** in the top-right corner and leave it on while using Paperplane.
5. Click **Load unpacked**. Inside the extracted `paperplane-main` folder, select **`extension`**. This is the folder containing `manifest.json`; do not select the ZIP or the outer repository folder.
6. Confirm that **Paperplane — Chat layout for Slack** appears and its switch is on.
7. Open your Slack workspace in Chrome, or refresh all existing Slack tabs. Paperplane's layout should appear. Use **Original Slack** whenever you want to switch back.

To start organizing, choose **Containers → + New** above the sidebar. Each teammate creates their own containers; downloading this repository does not copy anyone else's Slack chats or organization.

## Update an existing installation

Updates are **manual**. Downloading a new ZIP alone does not update the installed extension.

1. Download the latest source ZIP using the link above and extract it into a temporary folder.
2. Find the **original `extension` folder that you loaded into Chrome**. If you are unsure, open `chrome://extensions`, click Paperplane's **Details**, and look for its unpacked source path.
3. Copy everything **inside the new `extension` folder** into that original `extension` folder. Replace matching files and merge subfolders when prompted. Keep the original folder name and location; do not accidentally create an `extension/extension` folder.
4. Open `chrome://extensions` and click the circular **Reload** button on the existing Paperplane card.
5. Refresh every open Slack tab. Check the version on Paperplane's card or Details page against the version at the top of this README.

**Keep your containers:** update the existing installation in place, in the same Chrome profile. Do not click **Remove**, clear extension storage, or load a second copy from the new download folder. An in-place reload preserves local settings; uninstalling deletes them. Settings are not stored in the downloaded source files, and this version has no export/import feature.

## Quick troubleshooting

| Problem | What to do |
| --- | --- |
| “Manifest file is missing or unreadable” | Extract the ZIP first, then choose the inner `extension` folder containing `manifest.json`. |
| Slack still looks unchanged | Check that Paperplane is enabled in the same Chrome profile as Slack, refresh Slack, and select **Telegram style** in Paperplane's popup if Original Slack is selected. |
| An update has no effect | Replace the files at the original loaded path, reload Paperplane in `chrome://extensions`, then refresh Slack. Both reloads are needed. |
| Developer mode or Load unpacked is blocked | Ask your company's IT administrator whether manually installed extensions are allowed. |
| Something looks wrong | Switch to **Original Slack**. [Report an issue](https://github.com/Thin-K-ayn/paperplane/issues) with the Paperplane version and steps to reproduce; remove private workspace details from screenshots. |

To pause Paperplane without losing containers, use **Original Slack** or switch off its card in `chrome://extensions`. Keep the installed folder in place.

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
