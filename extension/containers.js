(() => {
  'use strict';
  if (document.getElementById('paperplane-containers')) return;
  const model = globalThis.PaperplaneContainers;
  const host = document.createElement('div');
  host.id = 'paperplane-containers';
  const shadow = host.attachShadow({mode:'open'});
  shadow.innerHTML = `
    <style>
      :host{display:block;font:13px/1.45 system-ui,sans-serif;color:var(--pp-text,#182c3a)}
      *{box-sizing:border-box} [hidden]{display:none!important}
      button,input,select{font:inherit;color:inherit} button,a{touch-action:manipulation}
      button{border:0;border-radius:7px;background:transparent;cursor:pointer;padding:7px 9px;min-height:32px}
      button:hover,a:hover{background:var(--pp-hover,#edf4f8)} button:disabled{opacity:.45;cursor:default}
      :focus-visible{outline:2px solid var(--pp-accent,#1686bd);outline-offset:-2px}
      .tabs{height:42px;display:flex;gap:4px;align-items:center;padding:4px 10px;background:var(--pp-surface,#fff);border-bottom:1px solid var(--pp-border,#e4ebef)}
      .tabs button{flex:1}.tabs [aria-pressed=true]{background:var(--pp-selected,#e3f1fb);color:var(--pp-accent,#1686bd)}
      #panel{position:absolute;inset:42px 0 0;display:flex;flex-direction:column;background:var(--pp-surface,#fff);padding:10px 8px 62px}
      .heading{display:flex;align-items:center;justify-content:space-between;padding:0 6px 6px}.heading strong{font-size:12px;color:var(--pp-muted,#617783)}
      #tree{overflow:auto;flex:1;min-height:0}ul{list-style:none;padding:0;margin:0}ul ul{padding-left:15px;border-left:1px solid var(--pp-border,#e4ebef);margin-left:10px}
      .row{display:flex;align-items:center;min-width:0;border-radius:8px;margin:2px 0}.row>.open{flex:1;text-align:left;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .row>.menu{flex:0 0 30px;padding:4px}.row a{display:flex;align-items:center;gap:10px;padding:7px 8px;color:inherit;text-decoration:none;border-radius:8px}
      .chat-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .unread-dot{flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:var(--pp-accent,#1686bd)}
      .row a:not(.unread):not([aria-current=page]){color:var(--pp-muted,#617783)}
      .row [aria-current=page]{background:var(--pp-selected,#e3f1fb);color:var(--pp-accent,#1686bd)}
      .container-title{display:flex;align-items:center;gap:7px;font-weight:500;line-height:1.4}
      .title-h1{font-size:18px}.title-h2{font-size:16px}
      .container-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .disclosure,.pin{font-size:11px;font-weight:400;color:var(--pp-muted,#617783);flex-shrink:0}
      .container-icon{flex-shrink:0}
      .unread-count{margin-left:auto;flex-shrink:0;min-width:20px;padding:1px 6px;border-radius:999px;background:var(--pp-accent,#1686bd);color:var(--pp-surface,#fff);font-size:11px;font-weight:650;line-height:18px;text-align:center;font-variant-numeric:tabular-nums}
      .row a{font-size:14px;font-weight:400}.row .unread{font-weight:750}
      .hint{color:var(--pp-muted,#617783);font-size:12px;margin:8px;line-height:1.5}
      #status{color:var(--pp-accent,#1686bd);padding:4px 8px;font-size:12px;flex-shrink:0}
      .empty{padding:16px 10px;color:var(--pp-muted,#617783)}
      .tabs,#panel,dialog{pointer-events:auto}
    </style>
    <div class="tabs" role="group" aria-label="Sidebar view"><button id="containers-tab" type="button" aria-pressed="false">Containers</button><button id="slack-tab" type="button" aria-pressed="true">Slack list</button></div>
    <section id="panel" aria-label="Your containers" hidden>
      <div class="heading"><strong>YOUR CONTAINERS</strong><button id="new" type="button" aria-label="New container">＋ New</button></div>
      <div id="tree"></div><div id="status" role="status"></div>
      <p class="hint">Local to this workspace in this browser.</p>
    </section>
    <dialog aria-labelledby="dialog-title"><form id="form"><h2 id="dialog-title"></h2><fieldset id="fields"><div id="inputs"></div><p id="error" role="alert"></p><div class="actions"><button id="remove" type="button" class="danger" hidden>Remove</button><button id="cancel" type="button">Cancel</button><button id="submit" class="primary" type="submit">Save</button></div></fieldset></form></dialog>`;
  const dialog = shadow.querySelector('dialog');
  // Keep a real input as event.target/document.activeElement for Slack's document-level shortcut guards.
  const editor = document.createElement('div');
  editor.id = 'paperplane-container-dialog';
  dialog.querySelectorAll('[id]').forEach(node=>{node.id='paperplane-'+node.id;});
  dialog.setAttribute('aria-labelledby','paperplane-dialog-title');
  editor.append(dialog);
  document.body.append(editor);
  for (const event of ['keydown','keypress','keyup']) editor.addEventListener(event,e=>e.stopPropagation());
  const $ = id => shadow.getElementById(id) || editor.querySelector(`#paperplane-${id}`);
  let workspace = '';
  let state = model.empty();
  let enabled = false;
  let ready = false;
  let busy = false;
  let timer;
  let signature = '';
  let catalog = new Map();
  const unreadChannels = new Set();
  const mutedChannels = new Set();
  let sections = [];
  let restoreFocus;
  let submit;
  let remove;
  const key = () => `paperplane.containers.${workspace}`;
  const workspaceId = () => location.pathname.match(/\/client\/(T[A-Z0-9]+)/)?.[1] || 'preview';
  const text = element => element?.textContent?.trim().slice(0,120) || '';
  const currentId = () => location.pathname.match(/\/client\/T[A-Z0-9]+\/([CDG][A-Z0-9]+)(?:\/|$)/)?.[1] ||
    document.querySelector('.p-channel_sidebar')?.getAttribute('data-qa-channel-sidebar-selected-item-id') || '';
  function element(tag, label, className) {
    const node = document.createElement(tag);
    if (label) node.textContent = label;
    if (className) node.className = className;
    return node;
  }
  function button(label, action, className) {
    const node = element('button',label,className);
    node.type = 'button'; node.addEventListener('click',action); return node;
  }
  function collect(sidebar) {
    const available = new Map();
    sidebar.querySelectorAll('[data-qa-channel-sidebar-channel-id]').forEach(node => {
      const id = node.getAttribute('data-qa-channel-sidebar-channel-id');
      const name = text(node.querySelector('.p-channel_sidebar__name strong') || node.querySelector('.p-channel_sidebar__name'));
      if (!/^[CDG][A-Z0-9]+$/.test(id || '') || !name) return;
      const muted=node.getAttribute('data-qa-channel-sidebar-channel-is-muted')==='true' || node.classList.contains('p-channel_sidebar__channel--muted');
      if (muted) mutedChannels.add(id); else mutedChannels.delete(id);
      const unread=!muted && node.classList.contains('p-channel_sidebar__channel--unread');
      if (unread) unreadChannels.add(id); else unreadChannels.delete(id);
      available.set(id,{channel:id,name,node,section:node.getAttribute('data-qa-channel-sidebar-channel-section-id'),unread});
    });
    const id = currentId();
    const name = text(document.querySelector('.p-view_header [data-qa="channel_name"], .p-view_header [data-qa="channel_name_button"]'));
    if (id && name && !available.has(id)) available.set(id,{channel:id,name});
    catalog = available;
    sections = Array.from(sidebar.querySelectorAll('[data-qa-channel-sidebar-section-heading]')).map(node => {
      const id = node.getAttribute('data-qa-channel-sidebar-section-heading');
      return {id,name:node.closest('[role="treeitem"]')?.getAttribute('aria-label') || text(node),
        chats:Array.from(available.values()).filter(chat=>chat.section===id)};
    }).filter(section=>section.name && section.chats.length);
  }
  function parents(select, selected, edited) {
    select.append(new Option('Top level',''));
    for (const container of state.items.filter(item=>item.kind==='container')) {
      try {
        if (edited && state.items.some(item=>item.id===edited.id)) model.change(state,{type:'edit',id:edited.id,name:edited.name,parent:container.id});
        else if (edited) model.change(state,{type:'add',item:{...edited,parent:container.id}});
        else model.change(state,{type:'add',item:{id:'candidate-'+crypto.randomUUID(),kind:'container',name:'New',parent:container.id}});
      } catch { continue; }
      select.append(new Option((container.parent ? '↳ ' : '')+container.name,container.id));
    }
    select.value = selected || '';
  }
  function field(label,node) {
    const caption = element('label',label);
    node.id ||= 'input-'+crypto.randomUUID(); caption.htmlFor=node.id;
    $('inputs').append(caption,node); return node;
  }
  function open(title) {
    if (!dialog.open) restoreFocus = shadow.activeElement;
    dialog.classList.remove('item-options'); dialog.removeAttribute('style');
    $('dialog-title').textContent=title;
    $('inputs').replaceChildren(); $('error').textContent='';
    $('remove').hidden=true; $('submit').hidden=false; $('submit').textContent='Save';
    submit=null; remove=null;
    if (!dialog.open) dialog.showModal();
  }
  function close() {
    dialog.close();
    if (restoreFocus?.isConnected) restoreFocus.focus();
    else (Array.from(shadow.querySelectorAll('[data-focus]')).find(node=>node.dataset.focus===restoreFocus?.dataset.focus) || $('new')).focus();
  }
  async function commit(transform) {
    if (busy || !ready) return false;
    busy=true; $('fields').disabled=true; $('tree').inert=true; $('new').disabled=true;
    const savedKey=key();
    try {
      const stored=await chrome.storage.local.get(null);
      if (savedKey!==key()) throw Error('Workspace changed. Please try again.');
      const next=model.validate(transform(model.validate(stored[savedKey])));
      await chrome.storage.local.set({[savedKey]:next});
      if (savedKey===key()) { state=next; render(); }
      return true;
    } catch(error) {
      const message=error.message || 'Could not save containers. Please reload Slack and try again.';
      $('status').textContent=message; $('error').textContent=message;
      return false;
    } finally { busy=false; $('fields').disabled=false; $('tree').inert=false; $('new').disabled=!ready; }
  }
  function edit(item=null,parent=null,mode='new') {
    open(item ? ({appearance:'Icon and color',rename:'Rename',move:'Move'})[mode]+' · '+item.name : 'New container');
    let name, destination;
    if (!item || mode==='rename') {
      name=field('Name',element('input')); name.maxLength=120; name.required=true; name.value=item?.name || '';
    }
    const candidate=item || {id:'new-'+crypto.randomUUID(),kind:'container',name:'New',parent};
    if (mode==='move') {
      destination=field('Move to',element('select'));
      parents(destination,item.parent,candidate);
    }
    let appearance;
    if (mode==='appearance') {
      const icon=field('Icon (emoji or symbol)',element('input'));icon.maxLength=24;icon.placeholder='📁';icon.value=item?.icon || '';
      const color=field('Text color',element('input'));color.type='color';color.value=item?.color || '#78c4f0';
      const theme=field('Use theme color',element('input'));theme.type='checkbox';theme.checked=!item?.color;
      const grid=element('div',null,'appearance-grid');
      for(const control of [icon,color,theme]) {
        const cell=element('div');cell.append(control.previousElementSibling,control);grid.append(cell);
      }
      $('inputs').append(grid);
      const preview=element('p',null,'container-preview');preview.setAttribute('aria-label','Container style preview');$('inputs').append(preview);
      function updatePreview() {
        color.disabled=theme.checked;
        preview.textContent=[icon.value.trim(),item.name].filter(Boolean).join(' ');
        preview.style.fontSize=(item.parent ? 16 : 18)+'px';
        preview.style.color=theme.checked?'':color.value;
      }
      for (const control of [icon,color,theme]) control.addEventListener('input',updatePreview);
      updatePreview();
      appearance=()=>({color:theme.checked?'':color.value,icon:icon.value.trim()});
    }
    submit=async()=>{
      const style=appearance?.() || {};
      if(await commit(s=> {
        const current=item && s.items.find(entry=>entry.id===item.id);
        const action=item ? {type:'edit',id:item.id,name:name?name.value.trim():current?.name,parent:destination?(destination.value||null):current?.parent,...style} :
          {type:'add',item:{...candidate,name:name.value.trim()}};
        return model.change(s,action);
      })) close();
    };
    $('inputs').querySelector('input,select')?.focus();
  }
  function options(item,anchor) {
    const bounds=anchor.getBoundingClientRect();
    open('Options for '+item.name);
    restoreFocus=anchor;
    dialog.classList.add('item-options'); $('submit').hidden=true;
    const choices=[
      [item.pinned?'Unpin':'Pin',async()=>{if(await commit(s=>model.change(s,{type:'pin',id:item.id})))close();}],
      ...(item.kind==='container'?[['Icon and color',()=>edit(item,null,'appearance')]]:[]),
      ['Rename',()=>edit(item,null,'rename')],
      ['Move',()=>edit(item,null,'move')],
      ['Remove',()=>{
        open('Remove '+item.name+'?'); $('submit').hidden=true; $('remove').hidden=false;
        $('inputs').append(element('p',item.kind==='container'?'Its contents will move up one level.':'This only removes the shortcut. You will remain in the Slack conversation.','hint'));
        remove=async()=>{if(await commit(s=>model.change(s,{type:'remove',id:item.id})))close();};
      }]
    ];
    for(const [label,action] of choices) $('inputs').append(button(label,action));
    dialog.style.left=Math.max(8,Math.min(bounds.right-dialog.offsetWidth,innerWidth-dialog.offsetWidth-8))+'px';
    dialog.style.top=Math.max(8,Math.min(bounds.bottom,innerHeight-dialog.offsetHeight-8))+'px';
    $('inputs').querySelector('button').focus();
  }
  function add(parent) {
    open('Add to '+state.items.find(item=>item.id===parent).name);
    $('submit').hidden=true;
    const container=state.items.find(item=>item.id===parent);
    if (!container.parent) $('inputs').append(button('＋ New subcontainer',()=>edit(null,parent)));
    const candidates=state.items.filter(item=>item.kind==='container'&&item.id!==parent);
    const moveable=candidates.filter(item=>{try {model.change(state,{type:'edit',id:item.id,name:item.name,parent});return true;}catch{return false;}});
    if (moveable.length) {
      const select=field('Move an existing container here',element('select'));
      select.append(new Option('Choose a container…','')); moveable.forEach(item=>select.append(new Option(item.name,item.id)));
      select.addEventListener('change',async()=>{
        const item=state.items.find(item=>item.id===select.value);
        if(item && await commit(s=>model.change(s,{type:'edit',id:item.id,name:item.name,parent})))close();
      });
    }
    const search=field('Add or move a chat',element('input')); search.type='search'; search.placeholder='Search available chats';
    const results=element('div'); results.id='results'; $('inputs').append(results);
    const chats=new Map(state.items.filter(item=>item.kind==='chat').map(item=>[item.channel,item]));
    catalog.forEach((chat,id)=>chats.set(id,chat));
    function filter() {
      results.replaceChildren();
      for(const chat of chats.values()) {
        if(!chat.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()))continue;
        const existing=state.items.find(item=>item.kind==='chat'&&item.channel===chat.channel);
        const choice=button(`${chat.channel===currentId()?'Current · ':''}${chat.name}${existing?.parent===parent?' · Added':''}`,async()=>{
          if(await commit(s=>model.change(s,{type:'add',item:{id:'chat-'+chat.channel,kind:'chat',channel:chat.channel,name:chat.name,parent}})))close();
        });
        choice.disabled=existing?.parent===parent; results.append(choice);
      }
      if(!results.childElementCount)results.append(element('p','No matching chats. Open the conversation in Slack, then add it here.','hint'));
    }
    search.addEventListener('input',filter); filter();
    $('inputs').append(element('p','Shows the current chat, rendered Slack sidebar chats, and saved shortcuts. To find another chat, open it in Slack first.','hint'));
    if(!container.parent && sections.length) {
      const select=field('Copy a visible Slack section as a subcontainer',element('select'));
      select.append(new Option('Choose a section…',''));
      sections.forEach(section=>select.append(new Option(`${section.name} (${section.chats.length} visible chats)`,section.id)));
      select.addEventListener('change',async()=>{
        const section=sections.find(item=>item.id===select.value); if(!section)return;
        if(await commit(s=>{
          const id='folder-'+crypto.randomUUID();
          let next=model.change(s,{type:'add',item:{id,kind:'container',name:section.name,parent}});
          for(const chat of section.chats) next=model.change(next,{type:'add',item:{id:'chat-'+chat.channel,kind:'chat',name:chat.name,channel:chat.channel,parent:id}});
          return next;
        }))close();
      });
      $('inputs').append(element('p','Copies only the chats currently rendered in Slack. Expand the original section first. This copy does not follow later section changes.','hint'));
    }
    search.focus();
  }
  function render() {
    const focused=shadow.activeElement?.dataset.focus;
    const scroll=$('tree').scrollTop;
    host.dataset.view=state.view;
    host.parentElement?.setAttribute('data-paperplane-sidebar-view',state.view);
    $('panel').hidden=state.view!=='containers';
    $('containers-tab').setAttribute('aria-pressed',String(state.view==='containers'));
    $('slack-tab').setAttribute('aria-pressed',String(state.view==='slack'));
    $('new').disabled=!ready;
    const list=element('ul'); list.setAttribute('aria-label','Containers and chats');
    const {unread,counts}=model.unreadState(state.items,unreadChannels);
    function branch(parent,target) {
      for(const item of model.orderedItems(state.items,parent,mutedChannels)) {
        const li=element('li'), row=element('div',null,'row'); li.append(row); target.append(li);
        if(item.kind==='container') {
          const level=item.parent ? 2 : 1;
          const expand=button('',()=>commit(s=>model.change(s,{type:'collapse',id:item.id})),`open container-title title-h${level}`);
          const arrow=element('span',item.collapsed?'▸':'▾','disclosure');arrow.setAttribute('aria-hidden','true');
          expand.append(arrow);
          if(item.icon){const icon=element('span',item.icon,'container-icon');icon.setAttribute('aria-hidden','true');expand.append(icon);}
          const label=element('span',item.name,'container-name');label.setAttribute('role','heading');label.setAttribute('aria-level',String(level));
          if(item.color)label.style.color=item.color;
          expand.append(label);
          const count=counts.get(item.id);
          if(count){
            const badge=element('span',String(count),'unread-count');
            badge.setAttribute('aria-label',`${count} unread ${count===1?'chat':'chats'}`);
            badge.title=`${count} ${count===1?'chat has':'chats have'} unread activity, including subcontainers`;
            expand.append(badge);
          }
          if(unread.has(item.id)){expand.classList.add('unread');expand.title='Unread conversations inside';}
          expand.setAttribute('aria-expanded',String(!item.collapsed)); expand.dataset.focus='expand-'+item.id; row.append(expand);
          const insert=button('＋',()=>add(item.id),'menu'); insert.setAttribute('aria-label','Add to '+item.name); insert.dataset.focus='add-'+item.id; row.append(insert);
          if(!item.collapsed){const children=element('ul');li.append(children);branch(item.id,children);if(!children.childElementCount)children.append(element('li',item.parent?'Use + to add chats.':'Use + to add chats or a subcontainer.','hint'));}
        } else {
          const chat=catalog.get(item.channel);
          const link=element('a',null,'open');
          link.append(element('span',(item.channel.startsWith('D')?'@ ':'# ')+(chat?.name || item.name),'chat-name'));
          link.href=workspace==='preview'?'#'+item.channel:`https://app.slack.com/client/${workspace}/${item.channel}`;
          link.dataset.focus='chat-'+item.id;
          if(item.channel===currentId())link.setAttribute('aria-current','page');
          if(unread.has(item.id)){
            link.classList.add('unread');link.title='Unread messages';
            const dot=element('span',null,'unread-dot');dot.setAttribute('role','img');dot.setAttribute('aria-label','Unread messages');link.append(dot);
          }
          link.addEventListener('click',event=>{
            if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
            const native=catalog.get(item.channel)?.node;
            if(native?.isConnected){event.preventDefault();native.click();}
          });
          row.append(link);
        }
        if(item.pinned){const pin=element('span','📌','pin');pin.setAttribute('role','img');pin.setAttribute('aria-label','Pinned');row.append(pin);}
        const menu=button('⋯',()=>options(item,menu),'menu');menu.setAttribute('aria-label','More options for '+item.name);menu.setAttribute('aria-haspopup','dialog');menu.dataset.focus='edit-'+item.id;row.append(menu);
      }
    }
    branch(null,list); $('tree').replaceChildren(list);
    if(!state.items.length)$('tree').append(element('p','Create a container for a project or team. Put chats directly inside it, or group them into subcontainers.','empty'));
    $('tree').scrollTop=scroll;
    if(focused)Array.from(shadow.querySelectorAll('[data-focus]')).find(node=>node.dataset.focus===focused)?.focus();
  }
  async function refresh() {
    const nextWorkspace=workspaceId();
    if(workspace!==nextWorkspace) {
      workspace=nextWorkspace; ready=false; catalog.clear(); unreadChannels.clear(); mutedChannels.clear(); state=model.empty();
      if(dialog.open)close();
      const requested=workspace;
      try {
        const values=await chrome.storage.local.get(null);
        if(requested!==workspace)return;
        state=model.validate(values[key()]); enabled=values.paperplaneEnabled!==false; ready=true;
        $('status').textContent='';
      }catch(error){$('status').textContent=error.message;}
      signature='';
    }
    const sidebar=document.querySelector('.p-channel_sidebar');
    if(!sidebar)return;
    if(host.parentElement!==sidebar){sidebar.prepend(host);signature='';}
    host.hidden=!enabled;
    if(!enabled){sidebar.removeAttribute('data-paperplane-sidebar-view');if(dialog.open)close();return;}
    collect(sidebar);
    // shortcut: unseen native rows retain last observed unread/mute state until Slack renders them again.
    const next=JSON.stringify([state,currentId(),Array.from(catalog.values()).map(({channel,name})=>[channel,name]),Array.from(unreadChannels),Array.from(mutedChannels)]);
    if(next!==signature){signature=next;render();}
  }
  $('new').addEventListener('click',()=>edit());
  $('containers-tab').addEventListener('click',()=>commit(s=>model.change(s,{type:'view',view:'containers'})));
  $('slack-tab').addEventListener('click',()=>commit(s=>model.change(s,{type:'view',view:'slack'})));
  $('cancel').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();if(!busy)close();});
  dialog.addEventListener('click',event=>{
    const bounds=dialog.getBoundingClientRect();
    if(!busy && dialog.classList.contains('item-options') && event.target===dialog &&
      (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom))close();
  });
  $('form').addEventListener('submit',event=>{event.preventDefault();submit?.();});
  $('remove').addEventListener('click',()=>remove?.());
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=='local')return;
    if(changes.paperplaneEnabled)enabled=changes.paperplaneEnabled.newValue!==false;
    if(changes[key()]) {
      try {state=model.validate(changes[key()].newValue);ready=true;$('status').textContent='';}
      catch(error){ready=false;$('status').textContent=error.message;}
    }
    signature='';refresh();
  });
  new MutationObserver(()=>{
    if(!timer)timer=setTimeout(()=>{timer=0;refresh();},200);
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,
    attributeFilter:['class','data-qa-channel-sidebar-channel-is-muted','data-qa-channel-sidebar-selected-item-id','aria-current']});
  window.addEventListener('popstate',()=>refresh());
  refresh();
})();
