(() => {
  'use strict';
  if (document.getElementById('paperplane-controls')) return;

  const root = document.documentElement;
  const messageSelector = '.c-message_kit__message';
  const senderSelector = '[data-message-sender], .c-message__sender_button, [data-qa="message_sender_name"]';
  const workspace = () => location.pathname.match(/\/client\/(T[A-Z0-9]+)/)?.[1] || 'preview';
  const ownerKey = () => `paperplane.owner.${workspace()}`;
  let settings = {};
  let enabled = false;
  let selecting = false;

  const host = document.createElement('div');
  host.id = 'paperplane-controls';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; position: fixed; bottom: 12px; left: 82px; z-index: 2147483000; font: 13px/1.4 system-ui,sans-serif; color: #243746; }
      * { box-sizing: border-box; }
      .bar { display:flex; align-items:center; gap:4px; padding:5px; border:1px solid #dbe4eb; border-radius:24px; background:#fff; box-shadow:0 3px 16px #16365020; }
      button { border:0; background:transparent; color:inherit; font:inherit; cursor:pointer; border-radius:20px; min-height:34px; padding:6px 11px; }
      button:hover { background:#eef5fa; }
      button:focus-visible { outline:3px solid #2586c9; outline-offset:2px; }
      #toggle[aria-checked="true"] { color:#12689e; background:#e7f4fd; }
      #pick { border-left:1px solid #e5ebf0; }
      .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#9aa8b2; margin-right:7px; }
      [aria-checked="true"] .dot { background:#2698da; }
      #notice { max-width:290px; margin:0 0 8px; padding:12px; border:1px solid #dbe4eb; border-radius:14px; background:#fff; box-shadow:0 3px 16px #16365020; }
      [hidden] { display:none!important; }
      @media (prefers-color-scheme:dark) { :host { color:#e5edf4; } .bar,#notice { background:#172432; border-color:#344554; } button:hover { background:#263b4e; } #toggle[aria-checked="true"] { background:#24465f; color:#b9dfff; } }
    </style>
    <div id="notice" role="status" hidden></div>
    <div class="bar" aria-label="Paperplane appearance controls">
      <button id="toggle" type="button" role="switch" aria-label="Telegram-style layout" aria-checked="false"><span class="dot"></span><span id="label">Original Slack</span></button>
      <button id="pick" type="button" title="Choose your name on a message to align your bubbles to the right" hidden>Set my messages</button>
    </div>`;
  document.body.append(host);
  const toggle = shadow.getElementById('toggle');
  toggle.disabled = true;
  const pick = shadow.getElementById('pick');
  const notice = shadow.getElementById('notice');

  function announce(text) {
    notice.textContent = text;
    notice.hidden = !text;
  }

  async function save(values) {
    try {
      await chrome.storage.local.set(values);
      Object.assign(settings, values);
      apply();
      return true;
    } catch {
      announce('Could not save. Your layout works in this tab; reload after updating the extension.');
      return false;
    }
  }

  function memberId(element) {
    if (!element) return '';
    for (const attribute of ['data-message-sender', 'data-member-id', 'data-user-id']) {
      const value = element.getAttribute(attribute);
      if (/^[UW][A-Z0-9]+$/.test(value || '')) return value;
    }
    return element.getAttribute('href')?.match(/\/team\/([UW][A-Z0-9]+)(?:[/?#]|$)/)?.[1] || '';
  }

  function avatarId(element) {
    const avatar = element?.querySelector('img');
    for (const source of [avatar?.getAttribute('src'), avatar?.getAttribute('srcset')]) {
      // Slack's rendered avatar URL includes workspace and member IDs; no API or token access.
      const match = source?.match(/^https:\/\/ca\.slack-edge\.com\/(T[A-Z0-9]+)-([UW][A-Z0-9]+)-/);
      if (match && (workspace() === 'preview' || match[1] === workspace())) return match[2];
    }
    return '';
  }

  function classify() {
    if (!enabled) return;
    // shortcut: leading continuation rows without a rendered author stay left-aligned until their preceding row loads.
    const profile = document.querySelector('[data-qa="user-button"]');
    const detectedId = memberId(profile) || avatarId(profile);
    const ownId = detectedId || settings[ownerKey()];
    pick.hidden = Boolean(detectedId);
    if (detectedId && selecting) { cancelSelection(); announce(''); }
    const authors = new Map();
    document.querySelectorAll(messageSelector).forEach(message => {
      const sender = message.querySelector(senderSelector);
      let id = memberId(sender) || memberId(message) || avatarId(message.querySelector('.c-message_kit__avatar'));
      if (!id && message.querySelector('.p-message_pane_message__compact_timestamp--adjacent')) {
        const previousRow = message.closest('.c-virtual_list__item')?.previousElementSibling;
        const previous = previousRow?.matches('.c-virtual_list__item') ? previousRow.querySelector(messageSelector) : null;
        const channel = message.getAttribute('data-msg-channel-id');
        if (previous && channel && channel === previous.getAttribute('data-msg-channel-id') &&
            Number(message.getAttribute('data-msg-ts')) > Number(previous.getAttribute('data-msg-ts'))) {
          id = authors.get(previous) || '';
        }
      }
      authors.set(message, id);
      const own = Boolean(ownId && id === ownId);
      if (message.hasAttribute('data-paperplane-own') !== own) {
        message.toggleAttribute('data-paperplane-own', own);
      }
    });
  }

  const observer = new MutationObserver(records => {
    // Mutation callbacks run before paint; a timer lets new bubbles flash on the wrong side.
    if (records.some(record => record.type === 'childList' ||
        record.target.closest(`${messageSelector}, [data-qa="user-button"]`))) classify();
  });

  function cancelSelection() {
    selecting = false;
    root.removeAttribute('data-paperplane-picking');
    pick.textContent = 'Set my messages';
  }

  function apply() {
    const next = settings.paperplaneEnabled !== false;
    observer.disconnect();
    enabled = next;
    root.toggleAttribute('data-paperplane', enabled);
    toggle.setAttribute('aria-checked', String(enabled));
    shadow.getElementById('label').textContent = enabled ? 'Telegram style' : 'Original Slack';
    pick.hidden = !enabled;
    if (enabled) {
      classify();
      observer.observe(document.body, { childList:true, subtree:true, attributes:true,
        attributeFilter:['data-message-sender','data-user-id','data-member-id','data-item-key','data-msg-ts','data-msg-channel-id','class','src','srcset','href'] });
    } else {
      cancelSelection();
      document.querySelectorAll('[data-paperplane-own]').forEach(node => node.removeAttribute('data-paperplane-own'));
    }
  }

  toggle.addEventListener('click', async () => {
    toggle.disabled = true;
    announce('');
    settings.paperplaneEnabled = !enabled;
    apply();
    await save({ paperplaneEnabled: enabled });
    toggle.disabled = false;
  });
  pick.addEventListener('click', () => {
    if (selecting) { cancelSelection(); announce(''); return; }
    selecting = true;
    root.setAttribute('data-paperplane-picking', '');
    pick.textContent = 'Cancel';
    announce('Click your name above one of your messages. Your messages will move to the right. Press Escape to cancel.');
  });
  document.addEventListener('keydown', event => {
    if (selecting && event.key === 'Escape') { cancelSelection(); announce(''); }
  }, true);
  document.addEventListener('click', async event => {
    if (!selecting || !(event.target instanceof Element)) return;
    const sender = event.target.closest(senderSelector);
    if (!sender || !sender.closest(messageSelector)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const id = memberId(sender) || memberId(sender.closest(messageSelector));
    if (!id) { announce('Slack did not expose a member ID here. Try your name on another message, or press Escape.'); return; }
    cancelSelection();
    if (await save({ [ownerKey()]: id })) announce('Your bubbles are now on the right. You can change this with Set my messages.');
  }, true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const [key, change] of Object.entries(changes)) {
      if (key === 'paperplaneEnabled' || key.startsWith('paperplane.owner.')) settings[key] = change.newValue;
    }
    apply();
  });
  chrome.storage.local.get(null).then(values => {
    settings = values;
    apply();
    toggle.disabled = false;
  }).catch(() => {
    settings = { paperplaneEnabled: false };
    apply();
    toggle.disabled = false;
    announce('Settings unavailable. Reload this Slack tab to reconnect the extension.');
  });
})();
