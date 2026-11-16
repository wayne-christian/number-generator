const DEFAULT_TIMING = {
  attention: 1050,
  message: 1750,
  initialSpin: 350,
  stops: [700, 700, 700, 850],
  gaps: [450, 450, 750],
};

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export async function playSequence({
  code,
  reels,
  onStateChange,
  onDigitSelected,
  timing = DEFAULT_TIMING,
}) {
  if (!/^\d{4}$/.test(code)) {
    throw new Error('The game code must contain exactly four digits.');
  }

  if (reels.length !== 4) {
    throw new Error('The experience requires exactly four number reels.');
  }

  onStateChange('attention');
  await wait(timing.attention);

  onStateChange('message');
  await wait(timing.message);

  onStateChange('spinning');
  reels.forEach((reel) => reel.spin());
  await wait(timing.initialSpin);

  for (let index = 0; index < reels.length; index += 1) {
    await reels[index].stop(Number(code[index]), timing.stops[index]);
    onDigitSelected();

    if (index < reels.length - 1) {
      await wait(timing.gaps[index]);
    }
  }

  onStateChange('result', code);
}
