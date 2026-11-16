export function isValidCode(code) {
  return typeof code === 'string' && /^\d{4}$/.test(code);
}

export function randomInteger(max) {
  if (!Number.isInteger(max) || max < 1 || max > 0x100000000) {
    throw new RangeError('Random range must be a positive 32-bit integer.');
  }

  const limit = Math.floor(0x100000000 / max) * max;
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % max;
}

export function randomCode() {
  return String(randomInteger(10000)).padStart(4, '0');
}

export function generatePlayCode(winningCode, random = randomInteger) {
  if (!isValidCode(winningCode)) {
    throw new Error('A valid winning safe code is required.');
  }

  if (random(100) === 0) return winningCode;

  const safeNumber = Number(winningCode);
  const candidate = random(9999);
  return String(candidate >= safeNumber ? candidate + 1 : candidate).padStart(4, '0');
}
