import { isValidCode } from '../game/codes.js';

const STORAGE_KEY = 'ucas-winning-safe-code';
const DEFAULT_SAFE_CODE = '1996';

export function loadSafeCode() {
  const code = localStorage.getItem(STORAGE_KEY);
  if (code !== null && !isValidCode(code)) {
    throw new Error('Stored safe code is invalid.');
  }
  return code;
}

export function saveSafeCode(code) {
  if (!isValidCode(code)) {
    throw new Error('The safe code must contain exactly four digits.');
  }
  localStorage.setItem(STORAGE_KEY, code);
}

export function loadOrInitializeSafeCode() {
  const code = loadSafeCode();
  if (code !== null) return code;
  saveSafeCode(DEFAULT_SAFE_CODE);
  return DEFAULT_SAFE_CODE;
}
