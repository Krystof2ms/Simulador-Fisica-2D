import type { ControlsState } from '../types';
import { clamp } from '../utils/clamp';

export function updateControlsFromKeyboard(controls: ControlsState, event: KeyboardEvent, pressed: boolean): ControlsState {
  if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    return { ...controls, throttle: pressed ? clamp(controls.throttle + 1, -1, 1) : 0 };
  }

  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    return { ...controls, throttle: pressed ? clamp(controls.throttle - 1, -1, 1) : 0 };
  }

  if (event.code === 'ArrowDown' || event.code === 'KeyS') {
    return { ...controls, brake: pressed ? 1 : 0 };
  }

  return controls;
}
