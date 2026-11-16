import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePlayCode, isValidCode } from '../src/game/codes.js';
import { loadOrInitializeSafeCode, loadSafeCode, saveSafeCode } from '../src/storage/safe-code.js';

test('validates four-digit codes including leading zeroes', () => {
  assert.equal(isValidCode('0047'), true);
  for (const invalid of ['', '47', '12345', '12a4', 47, null]) {
    assert.equal(isValidCode(invalid), false);
  }
});

test('a winning draw returns the configured code', () => {
  assert.equal(generatePlayCode('0047', () => 0), '0047');
});

test('one out of 100 winning draws returns the safe code', () => {
  let winners = 0;
  for (let draw = 0; draw < 100; draw += 1) {
    let call = 0;
    const code = generatePlayCode('0047', () => call++ === 0 ? draw : 47);
    if (code === '0047') winners += 1;
  }
  assert.equal(winners, 1);
});

test('every non-winning candidate excludes the safe code', () => {
  for (const safe of ['0000', '0047', '9999']) {
    const outputs = new Set();
    for (let candidate = 0; candidate < 9999; candidate += 1) {
      let call = 0;
      const code = generatePlayCode(safe, () => call++ === 0 ? 1 : candidate);
      assert.match(code, /^\d{4}$/);
      assert.notEqual(code, safe);
      outputs.add(code);
    }
    assert.equal(outputs.size, 9999);
  }
});

test('invalid safe codes cannot start a play', () => {
  assert.throws(() => generatePlayCode(null), /valid winning safe code/);
});

test('safe code storage persists leading zeroes and rejects invalid stored values', () => {
  const data = new Map();
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  assert.equal(loadSafeCode(), null);
  assert.equal(loadOrInitializeSafeCode(), '1996');
  assert.equal(loadSafeCode(), '1996');
  saveSafeCode('0047');
  assert.equal(loadSafeCode(), '0047');
  assert.equal(loadOrInitializeSafeCode(), '0047');
  assert.throws(() => saveSafeCode('47'), /four digits/);
  assert.equal(loadSafeCode(), '0047');
  data.set('ucas-winning-safe-code', 'broken');
  assert.throws(() => loadSafeCode(), /invalid/);
  assert.throws(() => loadOrInitializeSafeCode(), /invalid/);
});
