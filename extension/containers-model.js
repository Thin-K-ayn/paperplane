/* Shared by the content script and the small Node regression suite. */
(() => {
  'use strict';
  const empty = () => ({version:1, view:'slack', items:[]});
  function validate(value) {
    if (value === undefined) return empty();
    if (!value || value.version !== 1 || !['slack','containers'].includes(value.view) || !Array.isArray(value.items)) {
      throw Error('Container settings could not be read. Your saved organization has not been changed.');
    }
    const ids = new Set();
    const items = value.items.map(item => {
      if (!item || typeof item.id !== 'string' || !/^[\w-]{1,100}$/.test(item.id) || ids.has(item.id) ||
          !['container','chat'].includes(item.kind) || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 ||
          !(item.parent === null || typeof item.parent === 'string') ||
          (item.kind === 'chat' && !/^[CDG][A-Z0-9]+$/.test(item.channel || ''))) throw Error('Invalid container data. Nothing was changed.');
      ids.add(item.id);
      const appearance = item.kind === 'container' ? {color:item.color ?? '', icon:item.icon ?? ''} : {};
      if (item.kind === 'container' && (typeof appearance.color !== 'string' || !/^(?:#[0-9a-fA-F]{6})?$/.test(appearance.color) ||
          typeof appearance.icon !== 'string' || appearance.icon.length > 24 || /[\u0000-\u001f\u007f]/.test(appearance.icon))) {
        throw Error('Choose a valid color and a short emoji or symbol.');
      }
      const normalized = {...item, ...appearance, name:item.name.trim(), collapsed:item.collapsed === true, pinned:item.pinned === true};
      delete normalized.heading; // Legacy manual sizes now follow nesting depth.
      return normalized;
    });
    const byId = new Map(items.map(item => [item.id,item]));
    for (const item of items) {
      let parent = item.parent;
      const seen = new Set([item.id]);
      let depth = item.kind === 'container' ? 1 : 0;
      while (parent !== null) {
        const ancestor = byId.get(parent);
        if (!ancestor || ancestor.kind !== 'container' || seen.has(parent)) throw Error('That move would create an invalid container.');
        seen.add(parent);
        if (++depth > 2) throw Error('Use two container levels: a container and its subcontainers.');
        parent = ancestor.parent;
      }
    }
    return {version:1, view:value.view, items};
  }
  function change(value, action) {
    const next = validate(value);
    const item = next.items.find(entry => entry.id === action.id);
    if (action.type === 'add') {
      const incoming = action.item;
      const existing = incoming.kind === 'chat' && next.items.find(entry => entry.kind === 'chat' && entry.channel === incoming.channel);
      if (existing) { existing.parent = incoming.parent; existing.name = incoming.name; }
      else next.items.push({...incoming});
    } else if (action.type === 'view') next.view = action.view;
    else {
      if (!item) throw Error('This item was changed in another tab. Please try again.');
      if (action.type === 'edit') {
        item.name = action.name; item.parent = action.parent;
        if (item.kind === 'container') for (const key of ['color','icon']) {
          if (action[key] !== undefined) item[key] = action[key];
        }
      }
      else if (action.type === 'collapse') item.collapsed = !item.collapsed;
      else if (action.type === 'pin') item.pinned = !item.pinned;
      else if (action.type === 'remove') {
        // Dissolve containers without deleting the chats or subcontainers they hold.
        next.items.forEach(child => { if (child.parent === item.id) child.parent = item.parent; });
        next.items = next.items.filter(entry => entry.id !== item.id);
      } else throw Error('Unknown container action.');
    }
    return validate(next);
  }
  function unreadState(items, unreadChannels) {
    const byId = new Map(items.map(item=>[item.id,item]));
    const unread = new Set();
    const channelsByContainer = new Map();
    for (const chat of items) {
      if (chat.kind !== 'chat' || !unreadChannels.has(chat.channel)) continue;
      unread.add(chat.id);
      let parent = byId.get(chat.parent);
      while (parent) {
        if (parent.collapsed) unread.add(parent.id);
        if (!channelsByContainer.has(parent.id)) channelsByContainer.set(parent.id,new Set());
        channelsByContainer.get(parent.id).add(chat.channel);
        parent = byId.get(parent.parent);
      }
    }
    return {unread,counts:new Map([...channelsByContainer].map(([id,channels])=>[id,channels.size]))};
  }
  function orderedItems(items,parent,mutedChannels) {
    let siblings=items.filter(item=>item.parent===parent).sort((a,b)=>Number(b.pinned===true)-Number(a.pinned===true));
    if(parent===null)return siblings;
    // Keep subcontainer slots and pin priority; only reorder chat slots within each pin group.
    for(const pinned of [true,false]) {
      const matches=item=>item.kind==='chat' && (item.pinned===true)===pinned;
      const chats=siblings.filter(matches).sort((a,b)=>Number(mutedChannels.has(a.channel))-Number(mutedChannels.has(b.channel)));
      let index=0;
      siblings=siblings.map(item=>matches(item)?chats[index++]:item);
    }
    return siblings;
  }
  const api = {empty,validate,change,unreadState,orderedItems};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globalThis.PaperplaneContainers = api;
})();
