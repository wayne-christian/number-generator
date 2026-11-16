const audioContext = new AudioContext();
const soundUrl = new URL('../../assets/sounds/selection.mp3', import.meta.url);

let selectionBufferPromise;
let selectionBuffer;

function loadSelectionBuffer() {
  selectionBufferPromise ??= fetch(soundUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load selection sound: ${response.status}`);
      }

      return response.arrayBuffer();
    })
    .then((audioData) => audioContext.decodeAudioData(audioData))
    .then((buffer) => {
      selectionBuffer = buffer;
      return buffer;
    });

  return selectionBufferPromise;
}

export async function prepareSelectionSound() {
  await Promise.all([audioContext.resume(), loadSelectionBuffer()]);
}

export function playSelectionSound() {
  if (audioContext.state !== 'running') {
    throw new Error('Audio playback is not available.');
  }

  if (!selectionBuffer) {
    throw new Error('Selection sound has not finished loading.');
  }

  const source = audioContext.createBufferSource();
  source.buffer = selectionBuffer;
  source.connect(audioContext.destination);
  source.start();
}
