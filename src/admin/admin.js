import { isValidCode, randomCode } from '../game/codes.js';
import { saveSafeCode } from '../storage/safe-code.js';

export function createAdmin({ getCode, onSaved, onExit }) {
  const root = document.querySelector('.screen--admin');
  const panels = [...root.querySelectorAll('[data-admin-panel]')];
  const inputs = [...root.querySelectorAll('.digit-inputs input')];
  const currentCode = root.querySelector('#current-code');
  const toggleCode = root.querySelector('#toggle-code');
  const error = root.querySelector('#admin-error');
  const entryError = root.querySelector('#entry-error');
  let pendingCode = '';
  let isRevealed = false;

  function showPanel(name) {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.adminPanel !== name;
    });
    error.textContent = '';
  }

  function updateCurrentCode() {
    const code = getCode();
    currentCode.textContent = code ? (isRevealed ? code : '••••') : 'NOT SET';
    toggleCode.disabled = !code;
    toggleCode.textContent = isRevealed ? 'HIDE CODE' : 'SHOW CODE';
  }

  function updatePendingCode(code) {
    pendingCode = code;
    root.querySelectorAll('[data-pending-code]').forEach((element) => {
      element.textContent = code;
    });
  }

  function generate() {
    try {
      let code;
      do {
        code = randomCode();
      } while (code === pendingCode);
      updatePendingCode(code);
      showPanel('generated');
    } catch (cause) {
      console.error('Unable to generate a safe code.', cause);
      error.textContent = 'Could not generate a code. Please check this device and try again.';
    }
  }

  function close() {
    isRevealed = false;
    updateCurrentCode();
    updatePendingCode('');
    inputs.forEach((input) => { input.value = ''; });
    entryError.textContent = '';
    showPanel('menu');
    onExit();
  }

  toggleCode.addEventListener('click', () => {
    isRevealed = !isRevealed;
    updateCurrentCode();
  });

  root.querySelector('#enter-code').addEventListener('click', () => {
    inputs.forEach((input) => { input.value = ''; });
    entryError.textContent = '';
    showPanel('entry');
    inputs[0].focus();
  });

  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(-1);
      entryError.textContent = '';
      if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        event.preventDefault();
        inputs[index - 1].value = '';
        inputs[index - 1].focus();
      }
    });
    input.addEventListener('paste', (event) => {
      event.preventDefault();
      const digits = event.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, inputs.length - index);
      [...digits].forEach((digit, offset) => { inputs[index + offset].value = digit; });
      if (digits) inputs[Math.min(index + digits.length, inputs.length - 1)].focus();
      entryError.textContent = '';
    });
  });

  root.querySelector('[data-admin-panel="entry"]').addEventListener('submit', (event) => {
    event.preventDefault();
    const code = inputs.map((input) => input.value).join('');
    if (!isValidCode(code)) {
      entryError.textContent = 'Enter all four digits.';
      return;
    }
    updatePendingCode(code);
    showPanel('manual-confirm');
  });

  root.querySelector('#cancel-manual').addEventListener('click', () => {
    showPanel('entry');
    inputs[0].focus();
  });
  root.querySelector('[data-admin-back]').addEventListener('click', () => {
    updatePendingCode('');
    showPanel('menu');
  });
  root.querySelector('#generate-code').addEventListener('click', generate);
  root.querySelector('#generate-another').addEventListener('click', generate);
  root.querySelector('#safe-set').addEventListener('click', () => showPanel('generated-confirm'));
  root.querySelector('#cancel-generated').addEventListener('click', () => showPanel('generated'));

  root.querySelectorAll('[data-confirm-code]').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        saveSafeCode(pendingCode);
        onSaved(pendingCode);
        isRevealed = false;
        updateCurrentCode();
        showPanel('saved');
      } catch (cause) {
        console.error('Unable to save the safe code.', cause);
        error.textContent = 'Could not save the code. Your previous code has not been changed.';
      }
    });
  });
  root.querySelector('#admin-exit').addEventListener('click', close);

  return {
    open() {
      isRevealed = false;
      updateCurrentCode();
      showPanel('menu');
      root.querySelector('#enter-code').focus();
    },
    close,
  };
}
