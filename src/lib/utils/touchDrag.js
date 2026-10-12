/**
 * Touch drag-and-drop for player cards and field slots.
 *
 * HTML5 drag events don't fire for touch, so touch drags are tracked by hand:
 * a touch that moves past TAP_SLOP becomes a drag, and on release the payload
 * is delivered as a TOUCH_DROP_EVENT to the nearest `[data-drop-zone]` under
 * the finger. A touch that never moves that far is left alone, so the
 * browser's normal click still fires and taps keep working.
 *
 * Elements using this set `touch-action` in CSS: `none` where any direction
 * is a drag, `pan-y` where vertical movement must keep scrolling a list.
 */

export const TOUCH_DROP_EVENT = 'playertouchdrop';

const TAP_SLOP = 10;

/**
 * @param {() => object|null} getPayload - drag payload, or null if not draggable
 * @param {{ verticalScrolls?: boolean }} [options] - when true, a mostly-vertical
 *   move is treated as a scroll and abandons the drag
 */
export function createTouchDrag(getPayload, { verticalScrolls = false } = {}) {
  let state = null;

  function reset() {
    if (state?.dragging) state.el.style.opacity = '';
    state = null;
  }

  return {
    start(e) {
      const payload = getPayload();
      if (!payload || e.touches.length !== 1) return;
      const t = e.touches[0];
      state = { x: t.clientX, y: t.clientY, el: e.currentTarget, payload, dragging: false };
    },
    move(e) {
      if (!state || state.dragging) return;
      const t = e.touches[0];
      const dx = Math.abs(t.clientX - state.x);
      const dy = Math.abs(t.clientY - state.y);
      if (Math.hypot(dx, dy) < TAP_SLOP) return;
      if (verticalScrolls && dy > dx) {
        reset();
        return;
      }
      state.dragging = true;
      state.el.style.opacity = '0.5';
    },
    end(e) {
      if (!state) return;
      const { dragging, payload } = state;
      reset();
      if (!dragging) return;
      e.preventDefault(); // suppress the click that would follow a drag
      const t = e.changedTouches[0];
      const zone = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-drop-zone]');
      zone?.dispatchEvent(new CustomEvent(TOUCH_DROP_EVENT, { detail: payload }));
    },
    cancel: reset
  };
}

/** Read the drag payload from an HTML5 drop event. */
export function readDropPayload(e) {
  try {
    return JSON.parse(e.dataTransfer.getData('application/json'));
  } catch {
    return null;
  }
}
