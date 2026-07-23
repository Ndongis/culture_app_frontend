import React, { useEffect, useRef } from "react";

export default function Musee3dComponent({ onUnityLoaded, mode }) {
  const unityContainer = useRef(null);

  const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const traductionEndpoint = import.meta.env.VITE_TRADUCTION_ENDPOINT;
  const iaEndpoint = import.meta.env.VITE_IA_ENDPOINT;

  useEffect(() => {
    let activeInstance = null;
    let isMounted = true;

    // Éviter que Unity capture tout le clavier
    window.WebGLInput = window.WebGLInput || {};
    window.WebGLInput.captureAllKeyboardInput = false;

    // Charger le script Unity loader une seule fois
    if (!window.__UNITY_SCRIPT_LOADED__) {
      const script = document.createElement("script");
      script.src = "/musee3d/buildWebgl.loader.js";
      script.async = true;

      script.onload = () => {
        window.__UNITY_SCRIPT_LOADED__ = true;
        if (isMounted) initUnity();
      };

      document.body.appendChild(script);
    } else {
      initUnity();
    }

    function initUnity() {
      const canvas = unityContainer.current;
      if (!canvas || typeof window.createUnityInstance !== "function") return;

      const config = {
        dataUrl: "/musee3d/buildWebgl.data.br",
        frameworkUrl: "/musee3d/buildWebgl.framework.js.br",
        codeUrl: "/musee3d/buildWebgl.wasm.br",
        companyName: "MonEntreprise",
        productName: "MonJeu",
        productVersion: "1.0",
      };

      window
        .createUnityInstance(canvas, config)
        .then((instance) => {
          if (!isMounted) {
            // Si le composant a été démonté pendant le chargement, on détruit l'instance immédiatement
            instance.Quit().then(() => cleanCanvasMemory(canvas));
            return;
          }

          activeInstance = instance;
          window.unityInstance = instance;

          // Configuration du contexte et des endpoints
          if (mode === "Editor") {
            instance.SendMessage("Main", "setContexte", "Editor");
          } else {
            instance.SendMessage("Main", "setContexte", "Visitor");
          }

          instance.SendMessage("Main", "SetLanguageUrl", `${apiUrl}${traductionEndpoint}`);
          instance.SendMessage("Main", "SetIaUrl", `${apiUrl}${iaEndpoint}`);

          // Empêcher Unity de prendre le focus clavier
          canvas.tabIndex = -1;
          canvas.blur();
          canvas.onkeydown = null;
          canvas.onkeyup = null;

          if (onUnityLoaded) onUnityLoaded();
        })
        .catch((err) => {
          console.error("Unity init error:", err);
        });
    }

    // Gestion du focus HTML / Unity
    const handleFocusIn = (e) => {
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        target.focus();
        if (unityContainer.current) {
          unityContainer.current.blur();
          unityContainer.current.style.pointerEvents = "none";
        }
      }
    };

    const handleFocusOut = () => {
      if (unityContainer.current) {
        unityContainer.current.style.pointerEvents = "auto";
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    // Fonction pour libérer la mémoire WebGL du Canvas
    function cleanCanvasMemory(canvasElement) {
      if (!canvasElement) return;
      try {
        const gl = canvasElement.getContext("webgl") || canvasElement.getContext("webgl2");
        if (gl) {
          // Force le GPU à relâcher immédiatement les textures et shaders liés au canvas
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      } catch (e) {
        console.warn("Impossible de forcer loseContext", e);
      }
    }

    // Cycle de démontage et libération RAM stricte
    return () => {
      isMounted = false;
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);

      const canvasRefCopy = unityContainer.current;

      if (activeInstance) {
        activeInstance.Quit()
          .then(() => {
            console.log("Unity instance successfully terminated from RAM.");
          })
          .catch((err) => {
            console.error("Error during Unity instance Quit:", err);
          })
          .finally(() => {
            // Détruire les références globales pour le Garbage Collector
            if (window.unityInstance === activeInstance) {
              window.unityInstance = null;
            }
            activeInstance = null;
            
            // Forcer le nettoyage mémoire du GPU
            cleanCanvasMemory(canvasRefCopy);
          });
      } else {
        cleanCanvasMemory(canvasRefCopy);
      }
    };
  }, [mode, apiUrl, traductionEndpoint, iaEndpoint]); // Ajout des dépendances pour éviter les closures périmées

  return (
    <div style={{ width: "100%", height: "100%", margin: "auto" }}>
      <canvas
        id="unity-canvas"
        ref={unityContainer}
        style={{
          width: "100%",
          height: "100%",
          outline: "none",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}