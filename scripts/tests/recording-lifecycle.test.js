const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  let page;
  const stops = new Set(), errors = new Set();
  const uploads = [], toasts = [], timers = new Set();
  let stopped = 0, refreshed = 0, writesAfterUnload = 0;
  const foreignStop = () => {}, foreignError = () => {};
  stops.add(foreignStop); errors.add(foreignError);
  const recorder = {
    onStop: f => stops.add(f), onError: f => errors.add(f),
    offStop: f => f ? stops.delete(f) : stops.clear(),
    offError: f => f ? errors.delete(f) : errors.clear(),
    start() {}, stop() { stopped++; }
  };
  const upload = {uploadAndSummarize: async (...args) => { uploads.push(args); }};
  const service = {
    requestKey: () => 'test-key',
    error: (p, e) => p.setData({error:e.message})
  };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../../pages/consultation-detail/consultation-detail.js'), 'utf8'), {
    Page: p => { page = p; },
    require: name => name.includes('consultationRecording') ? upload : name.includes('consultationService') ? service : {restore:()=>false},
    wx: {getRecorderManager: () => recorder, showModal: d => d.success({confirm:true}), showToast: d => toasts.push(d)},
    setInterval: f => { timers.add(f); return f; }, clearInterval: f => timers.delete(f), Date
  });
  page.data = structuredClone(page.data);
  page.setData = values => { if (page.unloaded) writesAfterUnload++; Object.assign(page.data, values); };
  page.refresh = () => { refreshed++; };
  page.onLoad({id:'31'});
  const emitStop = () => [...stops].forEach(f => f({tempFilePath:'wxfile://synthetic-recording.mp3'}));
  const emitError = () => [...errors].forEach(f => f({errMsg:'recording error'}));
  return {page, upload, uploads, toasts, timers, emitStop, emitError, stops, errors, foreignStop, foreignError,
    counts: () => ({stopped,refreshed,writesAfterUnload})};
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('离开页面后异步停止的录音仍提交一次，且不影响其他监听器', async () => {
  const h = harness();
  h.page.startRecording();
  const consent = h.page.recordingConsentAt;
  h.page.onHide(); h.page.onUnload();
  h.emitStop(); await settle();
  assert.equal(h.uploads.length, 1);
  assert.deepEqual(Array.from(h.uploads[0]), ['wxfile://synthetic-recording.mp3','31',consent]);
  assert.equal(h.counts().stopped, 1);
  assert.equal(h.counts().writesAfterUnload, 0);
  assert.equal(h.counts().refreshed, 0);
  assert.deepEqual([...h.stops], [h.foreignStop]);
  assert.deepEqual([...h.errors], [h.foreignError]);
  assert.equal(h.timers.size, 0);
});

test('上传过程中离开页面，不刷新已卸载页面且后台提交继续完成', async () => {
  const h = harness();
  let complete;
  h.upload.uploadAndSummarize = (...args) => { h.uploads.push(args); return new Promise(resolve => { complete = resolve; }); };
  h.page.startRecording(); h.page.stopRecording(); h.emitStop();
  h.page.onUnload(); complete(); await settle();
  assert.equal(h.uploads.length, 1);
  assert.equal(h.counts().writesAfterUnload, 0);
  assert.equal(h.counts().refreshed, 0);
  assert.deepEqual([...h.stops], [h.foreignStop]);
});

test('离开时录音失败仍释放本页监听器，且不产生空录音上传', async () => {
  const h = harness();
  h.page.startRecording(); h.page.onUnload(); h.emitError(); await settle();
  assert.equal(h.uploads.length, 0);
  assert.equal(h.counts().writesAfterUnload, 0);
  assert.deepEqual([...h.stops], [h.foreignStop]);
  assert.deepEqual([...h.errors], [h.foreignError]);
  assert.equal(h.timers.size, 0);
});
