import { Reel } from './animation/reel.js';
import { createAdmin } from './admin/admin.js';
import { playSelectionSound, prepareSelectionSound } from './audio/selection-sound.js';
import { generatePlayCode } from './game/codes.js';
import { playSequence } from './game/sequence.js';
import { loadOrInitializeSafeCode } from './storage/safe-code.js';

const RESULT_DURATION = 12_000;
const screens = [...document.querySelectorAll('[data-screen]')];
const reels = [...document.querySelectorAll('[data-reel]')].map((element) => new Reel(element));
const trigger = document.querySelector('#trigger');
const reload = document.querySelector('#reload');
const codeAnnouncement = document.querySelector('#code-announcement');

let state = 'idle';
let resetTimer = 0;
let winningCode = null;

const admin = createAdmin({
  getCode: () => winningCode,
  onSaved: (code) => { winningCode = code; },
  onExit: () => setState(winningCode ? 'idle' : 'setup'),
});

function setState(nextState, code = '') {
  state = nextState;
  document.body.dataset.mode = nextState === 'attention' ? 'active' : 'idle';

  if (nextState === 'spinning') {
    codeAnnouncement.textContent = 'Revealing your four-digit code.';
  } else if (nextState === 'result') {
    codeAnnouncement.textContent = `Your code is ${code.split('').join(' ')}. Try it in the safe.`;
  } else {
    codeAnnouncement.textContent = '';
  }

  const screenState = nextState === 'result' ? 'spinning' : nextState;
  for (const screen of screens) {
    const isVisible = screen.dataset.screen === screenState;
    screen.classList.toggle('is-visible', isVisible);
    screen.setAttribute('aria-hidden', String(!isVisible));
  }

  document.querySelector('.screen--reels').classList.toggle('is-result', nextState === 'result');
}

function resetExperience() {
  window.clearTimeout(resetTimer);
  reels.forEach((reel) => reel.reset());
  setState(winningCode ? 'idle' : 'setup');
}

async function startExperience() {
  if (state !== 'idle' || !winningCode) return;

  state = 'starting';
  try {
    const code = generatePlayCode(winningCode);
    await prepareSelectionSound();
    await playSequence({
      code,
      reels,
      onStateChange: setState,
      onDigitSelected: playSelectionSound,
    });
    resetTimer = window.setTimeout(resetExperience, RESULT_DURATION);
  } catch (cause) {
    console.error('Unable to run the experience.', cause);
    setState('error');
  }
}

trigger.addEventListener('click', startExperience);
reload.addEventListener('click', () => window.location.reload());

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLowerCase() === 'a') {
    event.preventDefault();
    if (event.repeat) return;
    if (state === 'admin') {
      admin.close();
    } else if (state === 'idle' || state === 'setup') {
      setState('admin');
      admin.open();
    }
    return;
  }

  if (state !== 'idle') return;
  if (event.code !== 'Space') return;

  event.preventDefault();
  if (event.repeat) return;

  void startExperience();
});

try {
  winningCode = loadOrInitializeSafeCode();
  setState('admin');
  admin.open();
} catch (cause) {
  console.error('Unable to load the safe code.', cause);
  setState('error');
}
