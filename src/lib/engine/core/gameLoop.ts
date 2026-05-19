import { fixedUpdate } from './fixedUpdate';
import type { EngineState } from './state';

export type LoopController = {
  stop: () => void;
};

export function createGameLoop(
  initialState: EngineState,
  onState: (state: EngineState) => void
): LoopController {
  let running = true;
  let state = initialState;
  let accumulator = 0;
  let previous = performance.now();

  const tick = (now: number) => {
    if (!running) return;

    accumulator += (now - previous) / 1000;
    previous = now;

    while (accumulator >= state.config.fixedDt) {
      state = fixedUpdate(state);
      accumulator -= state.config.fixedDt;
    }

    onState(state);
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);

  return {
    stop: () => {
      running = false;
    }
  };
}
