// utils/useFullscreenLandscape.js
export function enterImmersiveMode(containerElement) {
  // 1. Passer l'élément (la div qui contient l'image agrandie / le canvas Unity) en plein écran
  const el = containerElement;
  const requestFs =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||   // Safari/anciens Android WebView
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;

  const fsPromise = requestFs ? requestFs.call(el) : Promise.resolve();

  fsPromise
    .then(() => {
      // 2. Une fois en plein écran, forcer le paysage (uniquement mobile/Android)
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch((err) => {
          // Certains navigateurs (iOS Safari) ne supportent pas lock() -> on ignore l'erreur
          console.warn("Orientation lock non supportée :", err);
        });
      }
    })
    .catch((err) => {
      console.warn("Fullscreen non supporté ou refusé :", err);
    });
}

export function exitImmersiveMode() {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  }
}