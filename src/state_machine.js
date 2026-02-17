// src/state_machine.js
export function createStateMachine(sequenceKeys) {
  let idx = 0;

  return {
    get currentKey() {
      return sequenceKeys[idx];
    },
    next() {
      idx = (idx + 1) % sequenceKeys.length;
      return sequenceKeys[idx];
    },
    reset() {
      idx = 0;
      return sequenceKeys[idx];
    },
  };
}
