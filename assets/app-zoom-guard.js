/* Prevent accidental app-shell pinch zoom while preserving native reader zoom.
   Do not set user-scalable=no: browser accessibility zoom must remain available. */
(() => {
  const reader = document.getElementById('readerDialog');
  const inReader = (target) => Boolean(reader?.open && (reader.contains(target) || target === reader));
  const appGesture = (event) => !inReader(event.target);
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1 && appGesture(event) && event.cancelable) event.preventDefault();
  }, { passive: false });
  // Safari's nonstandard gesture events can zoom independently of touchmove.
  for (const type of ['gesturestart', 'gesturechange']) {
    document.addEventListener(type, (event) => {
      if (appGesture(event) && event.cancelable) event.preventDefault();
    }, { passive: false });
  }
})();
