const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const directory = path.resolve(__dirname, '../extension');
test('Manifest limits injection to Slack client and ships every referenced file', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
  assert.equal(manifest.manifest_version,3);
  assert.deepEqual(manifest.permissions,['storage']);
  assert.deepEqual(manifest.content_scripts[0].matches,['https://app.slack.com/client/*']);
  for (const file of [...manifest.content_scripts[0].js,...manifest.content_scripts[0].css,manifest.action.default_popup]) {
    assert.ok(fs.statSync(path.join(directory,file)).size > 0);
  }
  for (const file of [...manifest.content_scripts[0].js,'popup.js']) new vm.Script(fs.readFileSync(path.join(directory,file),'utf8'));
});
test('Popup rolls back failed saves and restores interaction', async () => {
  const input = {disabled:true,checked:false,addEventListener(_event,handler){this.change=handler;}};
  const status = {textContent:''};
  const context = {
    document:{getElementById(id){return id === 'enabled' ? input : status;}},
    chrome:{storage:{local:{async get(){return {paperplaneEnabled:true};},async set(){throw Error('disk unavailable');}},onChanged:{addListener(){}}}}
  };
  vm.runInNewContext(fs.readFileSync(path.join(directory,'popup.js'),'utf8'),context);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(input.checked,true);
  assert.equal(input.disabled,false);
  input.checked=false;
  await input.change();
  assert.equal(input.checked,true);
  assert.equal(input.disabled,false);
  assert.match(status.textContent,/Could not save/);
});

test('Store icons, policy, and popup metadata match the release', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
  assert.ok(manifest.description.length <= 132);
  for (const [size, file] of Object.entries(manifest.icons)) {
    const png = fs.readFileSync(path.join(directory,file));
    assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),Number(size));
    assert.equal(png.readUInt32BE(20),Number(size));
  }
  for (const file of Object.values(manifest.action.default_icon)) assert.ok(fs.existsSync(path.join(directory,file)));
  const popup = fs.readFileSync(path.join(directory,'popup.html'),'utf8');
  assert.ok(popup.includes(manifest.version));
  assert.ok(popup.includes('privacy.html'));
  assert.equal(fs.readFileSync(path.join(directory,'privacy.html'),'utf8'),fs.readFileSync(path.join(directory,'../docs/privacy.html'),'utf8'));
});
