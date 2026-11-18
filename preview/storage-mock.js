// Fixture-only adapter. Never included in the installable extension.
(() => {
  const listeners = [];
  let values;
  try { values = JSON.parse(localStorage.getItem('paperplane-preview') || 'null'); } catch { /* Use clean demo defaults. */ }
  values ||= { paperplaneEnabled:true, 'paperplane.owner.preview':'UDEMOME' };
  // Seed the explicit visual demo before the extension reads initial settings.
  if (new URLSearchParams(location.search).has('style-demo')) {
    Object.assign(values, {paperplaneEnabled:true,'paperplane.containers.preview':{version:1,view:'containers',items:[
    {id:'projects',kind:'container',name:'项目与协作',parent:null,icon:'📂',color:'#79c7f0'},
    {id:'engineering',kind:'container',name:'工程团队',parent:'projects',icon:'🛠️',color:'#75c9a5'},
    {id:'eng-chat',kind:'chat',name:'Engineering',channel:'CENGINEERING',parent:'engineering'},
    {id:'general-chat',kind:'chat',name:'General',channel:'CGENERAL',parent:'engineering'},
    {id:'art',kind:'container',name:'设计与美术',parent:null,icon:'🎨',color:'#c8a0f4',collapsed:true},
    {id:'design-chat',kind:'chat',name:'Design studio',channel:'CDESIGN',parent:'art'},
    {id:'releases',kind:'container',name:'发布与运行',parent:null,pinned:true,icon:'🚀',color:'#edba77',collapsed:true},
    {id:'launch-chat',kind:'chat',name:'Product launch',channel:'CLAUNCH',parent:'releases'}
  ]}});
  const mutedDemo=document.querySelector('[data-qa-channel-sidebar-channel-id="CGENERAL"]');
  mutedDemo.classList.add('p-channel_sidebar__channel--unread','p-channel_sidebar__channel--muted');
  mutedDemo.setAttribute('data-qa-channel-sidebar-channel-is-muted','true');
  for (const id of ['CDESIGN','CLAUNCH','CENGINEERING']) document.querySelector(`[data-qa-channel-sidebar-channel-id="${id}"]`).classList.add('p-channel_sidebar__channel--unread');
  }
  if (new URLSearchParams(location.search).has('store-demo')) {
    document.body.classList.add('store-demo');
    values = {paperplaneEnabled:true,'paperplane.owner.preview':'UDEMOME','paperplane.containers.preview':{version:1,view:'containers',items:[
      {id:'projects',kind:'container',name:'Projects',parent:null,icon:'📂',color:'#79c7f0'},
      {id:'team',kind:'container',name:'Engineering',parent:'projects',icon:'🛠️',color:'#75c9a5'},
      {id:'engineering',kind:'chat',name:'Engineering',channel:'CENGINEERING',parent:'team'},
      {id:'general',kind:'chat',name:'General',channel:'CGENERAL',parent:'team'},
      {id:'design',kind:'container',name:'Design',parent:'projects',icon:'🎨',color:'#c8a0f4'},
      {id:'design-chat',kind:'chat',name:'Design studio',channel:'CDESIGN',parent:'design'},
      {id:'releases',kind:'container',name:'Releases',parent:null,icon:'🚀',color:'#edba77',pinned:true},
      {id:'launch',kind:'chat',name:'Product launch',channel:'CLAUNCH',parent:'releases'}
    ]}};
    for (const id of ['CENGINEERING','CLAUNCH']) document.querySelector(`[data-qa-channel-sidebar-channel-id="${id}"]`).classList.add('p-channel_sidebar__channel--unread');
    const muted=document.querySelector('[data-qa-channel-sidebar-channel-id="CGENERAL"]');
    muted.classList.add('p-channel_sidebar__channel--unread','p-channel_sidebar__channel--muted');
    muted.setAttribute('data-qa-channel-sidebar-channel-is-muted','true');
    const profile=document.querySelector('.profile');profile.setAttribute('data-qa','user-button');profile.setAttribute('data-user-id','UDEMOME');
    document.querySelector('.demo-banner').innerHTML='<strong>Paperplane</strong><span>Fictional workspace · actual extension UI</span>';
  }
  window.chrome = {
    storage: {
      local: {
        async get(keys) {
          if (keys === null) return {...values};
          return {...keys, ...values};
        },
        async set(next) {
          const changes = Object.fromEntries(Object.entries(next).map(([key, value]) => [key, {oldValue:values[key],newValue:value}]));
          Object.assign(values, next);
          localStorage.setItem('paperplane-preview', JSON.stringify(values));
          listeners.forEach(listener => listener(changes, 'local'));
        }
      },
      onChanged: { addListener(listener) { listeners.push(listener); } }
    }
  };
})();
