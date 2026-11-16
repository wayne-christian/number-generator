const DIGITS_PER_CYCLE = 10;
const CYCLE_COUNT = 36;
const START_POSITION = 100;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROWS_PER_SECOND = REDUCED_MOTION ? 6 : 22;
const MINIMUM_STOP_ROWS = REDUCED_MOTION ? 2 : 20;

export class Reel {
  constructor(element) {
    this.element = element;
    this.position = START_POSITION;
    this.frameId = 0;
    this.lastFrameTime = 0;
    this.isSpinning = false;

    const digits = document.createDocumentFragment();
    for (let cycle = 0; cycle < CYCLE_COUNT; cycle += 1) {
      for (let digit = 0; digit < DIGITS_PER_CYCLE; digit += 1) {
        const cell = document.createElement('span');
        cell.className = 'reel-digit';
        cell.textContent = String(digit);
        digits.append(cell);
      }
    }

    this.element.replaceChildren(digits);
    this.rowHeight = this.measureRowHeight();
    this.render();
  }

  measureRowHeight() {
    const measuredHeight = this.element.firstElementChild.getBoundingClientRect().height;
    return measuredHeight || Number.parseFloat(window.getComputedStyle(this.element).fontSize);
  }

  spin() {
    this.rowHeight = this.measureRowHeight();
    this.element.parentElement.classList.remove('is-selected');
    this.isSpinning = true;
    this.lastFrameTime = 0;
    this.frameId = requestAnimationFrame((time) => this.tick(time));
  }

  tick(time) {
    if (!this.isSpinning) return;

    if (this.lastFrameTime) {
      const elapsed = Math.min((time - this.lastFrameTime) / 1000, 0.05);
      this.position += elapsed * ROWS_PER_SECOND;
      this.render();
    }

    this.lastFrameTime = time;
    this.frameId = requestAnimationFrame((nextTime) => this.tick(nextTime));
  }

  stop(targetDigit, duration) {
    this.isSpinning = false;
    cancelAnimationFrame(this.frameId);

    const firstAlignedPosition = Math.ceil(this.position);
    const currentDigit = firstAlignedPosition % DIGITS_PER_CYCLE;
    const targetOffset = (targetDigit - currentDigit + DIGITS_PER_CYCLE) % DIGITS_PER_CYCLE;
    const startPosition = this.position;
    let endPosition = firstAlignedPosition + targetOffset;
    while (endPosition - startPosition < MINIMUM_STOP_ROWS) {
      endPosition += DIGITS_PER_CYCLE;
    }
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animate = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - (1 - progress) ** 4;
        this.position = startPosition + (endPosition - startPosition) * eased;
        this.render();

        if (progress < 1) {
          this.frameId = requestAnimationFrame(animate);
          return;
        }

        this.position = endPosition;
        this.render();
        this.element.parentElement.classList.add('is-selected');
        resolve();
      };

      this.frameId = requestAnimationFrame(animate);
    });
  }

  reset() {
    this.isSpinning = false;
    cancelAnimationFrame(this.frameId);
    this.position = START_POSITION;
    this.element.parentElement.classList.remove('is-selected');
    this.render();
  }

  render() {
    this.element.style.transform = `translate3d(0, ${-this.position * this.rowHeight}px, 0)`;
  }
}
