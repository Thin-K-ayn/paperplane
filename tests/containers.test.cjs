const {test} = require('node:test');
const assert = require('node:assert/strict');
const {empty,validate,change,unreadState,orderedItems} = require('../extension/containers-model.js');
const add = (state,id,parent=null,kind='container') => change(state,{type:'add',item:{id,parent,kind,name:id,...(kind==='chat'?{channel:id}:{})}});
test('Mixed containers support two levels, moving chats, and dissolving without loss',()=>{
  let state=add(empty(),'work'); state=add(state,'team','work');
  state=add(state,'CONE','work','chat'); state=add(state,'DTWO','team','chat');
  assert.throws(()=>add(state,'too-deep','team'),/two container levels/);
  assert.throws(()=>change(state,{type:'edit',id:'work',name:'Work',parent:'team'}));
  state=add(state,'CONE','team','chat');
  assert.equal(state.items.filter(item=>item.channel==='CONE').length,1);
  assert.equal(state.items.find(item=>item.id==='CONE').parent,'team');
  state=change(state,{type:'remove',id:'work'});
  assert.equal(state.items.find(item=>item.id==='team').parent,null);
  state=change(state,{type:'remove',id:'team'});
  assert.equal(state.items.length,2); assert.ok(state.items.every(item=>item.parent===null));
});
test('Invalid or hostile stored trees fail closed without mutating their input',()=>{
  const valid=add(empty(),'work'); const before=JSON.stringify(valid);
  assert.throws(()=>change(valid,{type:'edit',id:'work',name:'',parent:null}));
  assert.equal(JSON.stringify(valid),before);
  for (const bad of [null,{version:2,view:'slack',items:[]},{...valid,items:[...valid.items,...valid.items]},
    {...valid,items:[{id:'bad',kind:'chat',name:'Bad',parent:null,channel:'javascript:alert(1)'}]},
    {...valid,items:[{id:'bad',kind:'container',name:'Bad',parent:'missing'}]}]) assert.throws(()=>validate(bad));
});
test('Moving a parent with children cannot create a third container level',()=>{
  let state=add(empty(),'a');state=add(state,'b');state=add(state,'child','a');
  assert.throws(()=>change(state,{type:'edit',id:'a',name:'a',parent:'b'}),/two container levels/);
  state=change(state,{type:'edit',id:'child',name:'renamed',parent:'b'});
  assert.equal(state.items.find(item=>item.id==='child').parent,'b');
  state=change(state,{type:'collapse',id:'b'});assert.equal(state.items.find(item=>item.id==='b').collapsed,true);
  assert.equal(change(state,{type:'view',view:'containers'}).view,'containers');
});
test('Existing layouts gain safe appearance defaults; edits and moves retain customization',()=>{
  let state=validate({version:1,view:'containers',items:[{id:'a',kind:'container',name:'Old',parent:null}]});
  assert.equal(state.items[0].heading,undefined);assert.equal(state.items[0].icon,'');assert.equal(state.items[0].color,'');
  state.items[0].heading=3;
  state=change(state,{type:'edit',id:'a',name:'Styled',parent:null,icon:'🎨',color:'#a855f7'});
  state=add(state,'b');state=change(state,{type:'edit',id:'a',name:'Moved',parent:'b'});
  assert.deepEqual([state.items[0].heading,state.items[0].icon,state.items[0].color],[undefined,'🎨','#a855f7']);
  assert.deepEqual(validate(JSON.parse(JSON.stringify(state))),state);
  for(const appearance of [{color:'url(https://example.com)'},{icon:'x'.repeat(25)},{icon:'\n'}]) {
    assert.throws(()=>change(state,{type:'edit',id:'a',name:'Bad',parent:'b',...appearance}));
  }
});
test('Pinning is local to an item, preserves the tree and persists through edits and serialization',()=>{
  let state=add(empty(),'root');state=add(state,'child','root');state=add(state,'CONE','child','chat');
  const original=JSON.stringify(state);
  assert.ok(state.items.every(item=>item.pinned===false));
  state=change(state,{type:'pin',id:'child'});state=change(state,{type:'pin',id:'CONE'});
  assert.deepEqual(state.items.map(({id,parent})=>[id,parent]),[['root',null],['child','root'],['CONE','child']]);
  state=change(state,{type:'edit',id:'child',name:'Renamed',parent:'root'});
  state=validate(JSON.parse(JSON.stringify(state)));
  assert.ok(state.items.find(item=>item.id==='child').pinned && state.items.find(item=>item.id==='CONE').pinned);
  state=change(state,{type:'pin',id:'child'});assert.equal(state.items.find(item=>item.id==='child').pinned,false);
  assert.ok(JSON.parse(original).items.every(item=>!item.pinned));
});
test('Unread propagates through collapsed ancestors and withdraws on expansion without marking chats read',()=>{
  let state=add(empty(),'root');state=add(state,'child','root');state=add(state,'CONE','child','chat');state=add(state,'CTWO','root','chat');
  state=add(state,'other');state=add(state,'COTHER','other','chat');
  const unread=new Set(['CONE']);
  assert.deepEqual([...unreadState(state.items,unread).unread],['CONE']);
  state=change(state,{type:'collapse',id:'child'});
  assert.deepEqual([...unreadState(state.items,unread).unread],['CONE','child']);
  state=change(state,{type:'collapse',id:'root'});
  assert.deepEqual([...unreadState(state.items,unread).unread],['CONE','child','root']);
  state=change(state,{type:'collapse',id:'root'});
  assert.deepEqual([...unreadState(state.items,unread).unread],['CONE','child']);
  state=change(state,{type:'collapse',id:'child'});
  assert.deepEqual([...unreadState(state.items,unread).unread],['CONE']);
  assert.deepEqual([...unread],['CONE']);assert.equal(unreadState(state.items,new Set()).unread.size,0);
});

test('Unread badges count unique unread chats recursively, independent of expansion',()=>{
  let state=add(empty(),'root');state=add(state,'child','root');state=add(state,'CONE','child','chat');
  state=add(state,'CTWO','root','chat');state=add(state,'empty');state=add(state,'COTHER',null,'chat');
  const unread=new Set(['CONE','CTWO','COTHER']);
  assert.deepEqual([...unreadState(state.items,unread).counts],[['child',1],['root',2]]);
  state=change(state,{type:'collapse',id:'root'});
  assert.equal(unreadState(state.items,unread).counts.get('root'),2);
  state.items.push({...state.items.find(item=>item.id==='CONE'),id:'legacy-duplicate'});
  assert.equal(unreadState(state.items,unread).counts.get('root'),2);
  unread.delete('CONE');
  assert.deepEqual([...unreadState(state.items,unread).counts],[['root',1]]);
  unread.delete('CTWO');assert.equal(unreadState(state.items,unread).counts.size,0);
});

test('Muted chats sink stably within pin groups without moving subcontainers or changing saved order',()=>{
  const items=[
    {id:'root',kind:'container',parent:null},
    {id:'CMUTE',kind:'chat',channel:'CMUTE',parent:'root'},
    {id:'child',kind:'container',parent:'root'},
    {id:'COPEN',kind:'chat',channel:'COPEN',parent:'root'},
    {id:'CPINMUTE',kind:'chat',channel:'CPINMUTE',parent:'root',pinned:true},
    {id:'CPINOPEN',kind:'chat',channel:'CPINOPEN',parent:'root',pinned:true},
    {id:'COPEN2',kind:'chat',channel:'COPEN2',parent:'root'},
    {id:'CMUTE2',kind:'chat',channel:'CMUTE2',parent:'root'},
    {id:'CNESTMUTE',kind:'chat',channel:'CNESTMUTE',parent:'child'},
    {id:'CNESTOPEN',kind:'chat',channel:'CNESTOPEN',parent:'child'},
    {id:'CROOTMUTE',kind:'chat',channel:'CROOTMUTE',parent:null},
    {id:'CROOTOPEN',kind:'chat',channel:'CROOTOPEN',parent:null}
  ];
  const before=JSON.stringify(items),muted=new Set(['CMUTE','CMUTE2','CPINMUTE','CNESTMUTE','CROOTMUTE']);
  const ids=parent=>orderedItems(items,parent,muted).map(n=>n.id);
  assert.deepEqual(ids('root'),['CPINOPEN','CPINMUTE','COPEN','child','COPEN2','CMUTE','CMUTE2']);
  assert.deepEqual(ids('child'),['CNESTOPEN','CNESTMUTE']);
  assert.deepEqual(ids(null),['root','CROOTMUTE','CROOTOPEN']);
  muted.clear();
  assert.deepEqual(ids('root'),['CPINMUTE','CPINOPEN','CMUTE','child','COPEN','COPEN2','CMUTE2']);
  assert.equal(JSON.stringify(items),before);
});
