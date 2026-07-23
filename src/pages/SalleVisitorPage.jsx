import { useEffect, useRef, useState } from "react";
import Musee3dComponent from "../component/Musee3DComponent";
import { useSalle } from "../component/context/SalleContext";
import axios from "axios";
import { AuthContext } from '../component/context/AuthContext';
import { useContext } from "react";
import Cookies from 'js-cookie';
import { enterImmersiveMode, exitImmersiveMode } from "../component/utils/useFullscreenLandscape";

export default function SalleVisitorPage() {

  const streamRef    = useRef(null);
  const processorRef = useRef(null);
  const ctxRef       = useRef(null);
  const chunksRef    = useRef([]);
  const authContext = useContext(AuthContext);
  const user = authContext?.user ?? null;

  const { salleId, expositionId } = useSalle();
  const [unityReady,  setUnityReady]  = useState(false);
  const [biensLoaded, setBiensLoaded] = useState(false);
  const [biens,       setBiens]       = useState([]);
  const [transitionOut,  setTransitionOut]  = useState(false);
  const [transitionGone, setTransitionGone] = useState(false);
  const transitionImage = typeof window !== 'undefined' ? localStorage.getItem('salle_transition_image') : null;
  const transitionNom   = typeof window !== 'undefined' ? (localStorage.getItem('salle_transition_nom') || '') : '';
  const [loadingDisplay, setLoadingDisplay] = useState(true);
const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const biensEndpoint = import.meta.env.VITE_BIENS_ENDPOINT;
  const exposEndpoint=import.meta.env.VITE_EXPO_ENDPOINT;
const institutionsEndpoint = import.meta.env.VITE_INSTITUTION_ENDPOINT;

const handleVisiter = () => {
  setIsExpanded(true); // ta logique actuelle d'agrandissement
  enterImmersiveMode(visitorContainerRef.current);
};

// Nettoyage quand on quitte la salle / démonte le composant
useEffect(() => {
  return () => exitImmersiveMode();
}, []);

  useEffect(() => {
      window.SetLanguageUser = async (langue) => {
        console.log("🌐 SetLanguageUser appelé avec :", langue);
        localStorage.setItem('langue', langue);
        console.log("📥 Langue reçue de Unity :",  localStorage.getItem('langue'));
      }});

useEffect(() => {
  // 1. On déclare la variable à l'extérieur du bloc "if" pour qu'elle soit accessible partout
  let timer = null;

  if (unityReady) {
    console.log("Unity est prêt, démarrage du compte à rebours de 5s...");
    
    timer = setTimeout(async() => {
      console.log("Enregistrer la vue");
      try {
        const res = await axios.post(`${apiUrl}${exposEndpoint}/enregistrer_vue/${expositionId}`);
        setBiens(res.data);
        console.log("✅ Enregistrement vue réussi :", res.data);
      } catch (err) {
        console.error("Erreur Enregistrement vue :", err);
        setBiens([]);
      }
      // Ajoutez ici votre appel API (fetch ou axios)
    }, 5000); // 5000 millisecondes = 5 secondes
  }
  
  // 2. Nettoyage : s'exécute si le composant se démonte OU si unityReady change
  return () => {
    if (timer) {
      clearTimeout(timer);
      console.log("Timeout annulé (composant quitté ou Unity réinitialisé)");
    }
  };
// 3. IMPORTANT : On ajoute unityReady ici pour que le code se relance dès que Unity devient prêt
}, [unityReady]); 

  // ── 1. Charger les biens de la salle ─────────────────────────────────────────
  useEffect(() => {
    if (!salleId) return;

    const loadBiens = async () => {
      try {
        const res = await axios.get(`${apiUrl}${biensEndpoint}/api/bien/salle/${salleId}`);
        setBiens(res.data);
        console.log("✅ Biens chargés :", res.data);
      } catch (err) {
        console.error("Erreur chargement biens :", err);
        setBiens([]);
      } finally {
        setBiensLoaded(true);
      }
    };

    loadBiens();
  }, [salleId]);

  // ── 2. Vérifier le fichier scène JSON ────────────────────────────────────────
  async function checkSceneFile() {
    console.log("Vérification du fichier scène pour :", `salle_${salleId}.json`);
    try {
      const response = await fetch(`${apiUrl}${biensEndpoint}/api/get_scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `salle_${salleId}.json`,
        }),
      });

      if (response.status === 404) {
        console.log("ℹ️ Pas de fichier scène pour cette salle");
        return null;
      }

      const result = await response.json();
      if (result.exists) {
        console.log("✅ Fichier scène trouvé :", result.data);
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Erreur checkSceneFile :", error);
      return null;
    }
  }

  // ── 3. Envoyer à Unity quand tout est prêt (même pattern que SalleEditPage) ──
  useEffect(() => {
    const sendToUnity = async () => {
      if (!unityReady || !biensLoaded || !window.unityInstance) return;
      if(user!=null){
          window.unityInstance.SendMessage("Main","SetGuestId",user.id)
      }else 
      if (!Cookies.get('guest_id')) {
        
      window.unityInstance.SendMessage("Main","SetGuestId",Cookies.get('guest_id'))
    }

      console.log("🚀 Envoi des biens à Unity (Visitor) !");

      const payload = JSON.stringify({ biens });

      const langue = localStorage.getItem('langue') || 'Français';
console.log("📤 Langue envoyée à Unity :", langue);
window.unityInstance.SendMessage("Main", "SetLanguage", langue);
let resExpo = null;
let resInst = null;

// Récupérer le nom de l'exposition
try {
    resExpo = await axios.get(`${apiUrl}${exposEndpoint}/api/expositions/${expositionId}`);
    const expositionNom = resExpo.data?.nom || '';
    if (expositionNom) {
        window.unityInstance.SendMessage("Main", "setExpositionNom", expositionNom);
        console.log("📤 Nom exposition envoyé à Unity :", expositionNom);
    }
} catch (err) {
    console.error("Erreur chargement nom exposition :", err);
}

// Récupérer le nom de l'institution liée à l'exposition
if (resExpo != null) {
    try {
        const institutionId = resExpo.data?.institution_id;
        if (institutionId) {
            resInst = await axios.get(`${apiUrl}${institutionsEndpoint}/api/institutions/${institutionId}`);
            const institutionNom = resInst.data?.nom || '';
            if (institutionNom) {
                window.unityInstance.SendMessage("Main", "setInstitutionNom", institutionNom);
                console.log("📤 Nom Institution envoyé à Unity :", institutionNom);
            }
        } else {
            console.warn("⚠️ Pas d'institution_id trouvé sur l'exposition");
        }
    } catch (err) {
        console.error("Erreur chargement nom institution :", err);
    }
}
      

      // Récupérer le modèle de salle + nom de salle
      try {
        console.log(`API URL: ${apiUrl}${exposEndpoint}`);
        const url=`${apiUrl}${exposEndpoint}`;
        console.log("url "+url)
        const res = await axios.get(`${url}api/get_salle_and_modele/${salleId}/`);
        const salle = res.data;
        window.unityInstance.SendMessage("PositionController", "SetPosition", salle.modele_salle.nom);
        const salleNom = salle?.nom || salle?.name || '';
        if (salleNom) {
          window.unityInstance.SendMessage("Main", "setSalleNom", salleNom);
          console.log("📤 Nom salle envoyé à Unity :", salleNom);
        }
      } catch (err) {
        console.error("Erreur chargement modèle salle :", err);
      }

      // Charger et envoyer la scène
      const sceneData = await checkSceneFile();

      if (sceneData != null) {
        window.unityInstance.SendMessage("BienController", "receiveAllBiens", payload);
        window.unityInstance.SendMessage("BienController", "initGalerieObjets", JSON.stringify(sceneData));
        console.log("📤 Scène envoyée à Unity");
      }
    };

    sendToUnity();
  }, [unityReady, biensLoaded]);

  // ── Micro ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    window.startReactMic = startMic;
    window.stopReactMic  = stopMic;
    window.UndisplayLoading = () => {setLoadingDisplay(false);
      console.log("snss "+loadingDisplay)
    };
  }, []);

  useEffect(() => {
    console.log("Guest id                                                                   "+Cookies.get('guest_id'))
    console.log("loadingDisplay changed:", loadingDisplay);
  if (!loadingDisplay) {
    console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::loadingDisplay changed:", loadingDisplay);
    setTransitionOut(true);
    const timer = setTimeout(() => {
      setTransitionGone(true);
    }, 1000);

    return () => clearTimeout(timer); // nettoyage important
  }
}, [loadingDisplay]);


  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const ctx = new AudioContext({ sampleRate: 44100 });
    ctxRef.current = ctx;
    const source    = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;
    chunksRef.current    = [];
    processor.onaudioprocess = (e) => {
      chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    source.connect(processor);
    processor.connect(ctx.destination);
    window.unityInstance?.SendMessage("MicrophoneAudio", "SetMicStarted", "true");
  };

  const stopMic = () => {
    processorRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(t => t.stop());
    ctxRef.current?.close();
    const allSamples = mergeFloat32Arrays(chunksRef.current);
    const wavBuffer  = encodeWAV(allSamples, 44100);
    const base64     = arrayBufferToBase64(wavBuffer);
    window.unityInstance?.SendMessage("MicrophoneAudio", "ReceiveWav",    base64);
    window.unityInstance?.SendMessage("MicrophoneAudio", "SetMicStarted", "false");
  };

  const mergeFloat32Arrays = (arrays) => {
    const total  = arrays.reduce((sum, a) => sum + a.length, 0);
    const result = new Float32Array(total);
    let offset   = 0;
    for (const arr of arrays) { result.set(arr, offset); offset += arr.length; }
    return result;
  };

  const encodeWAV = (samples, sampleRate) => {
    const byteCount = samples.length * 2;
    const buffer    = new ArrayBuffer(44 + byteCount);
    const view      = new DataView(buffer);
    writeString(view, 0,  "RIFF");
    view.setUint32( 4, 36 + byteCount, true);
    writeString(view, 8,  "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16,             true);
    view.setUint16(20,  1,             true);
    view.setUint16(22,  1,             true);
    view.setUint32(24, sampleRate,     true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32,  2,             true);
    view.setUint16(34, 16,             true);
    writeString(view, 36, "data");
    view.setUint32(40, byteCount,      true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const c = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, c < 0 ? c * 0x8000 : c * 0x7FFF, true);
      offset += 2;
    }
    return buffer;
  };

  const writeString = (view, offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      zIndex: 9999,
    }}>
      {/* ── Transition plein écran ── */}
      {!transitionGone && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          opacity: transitionOut ? 0 : 1,
          transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: transitionOut ? 'none' : 'all',
          overflow: 'hidden',
        }}>
          {/* Image */}
          {transitionImage ? (
            <img
              src={transitionImage}
              alt={transitionNom}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                transform: transitionOut ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#0d0d0d' }} />
          )}

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%)',
          }} />

          {/* Spinner double anneau doré */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8rem',
          }}>
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '2px solid rgba(212,175,55,0.2)',
                borderTop: '2px solid #D4AF37',
                animation: 'spinV 1s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 10, borderRadius: '50%',
                border: '2px solid rgba(212,175,55,0.1)',
                borderBottom: '2px solid rgba(212,175,55,0.7)',
                animation: 'spinV 1.4s linear infinite reverse',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37', opacity: 0.9 }} />
              </div>
            </div>
          </div>

          {/* Texte bas droite */}
          <div style={{
            position: 'absolute', bottom: '2.8rem', right: '3rem',
            textAlign: 'right',
            transform: transitionOut ? 'translateY(8px)' : 'translateY(0)',
            opacity: transitionOut ? 0 : 1,
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            {transitionNom && (
              <p style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 600, fontStyle: 'italic',
                color: '#ffffff', margin: 0, lineHeight: 1.15,
                textShadow: '0 2px 24px rgba(0,0,0,0.5)',
                letterSpacing: '-0.01em',
              }}>
                {transitionNom}
              </p>
            )}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.55)',
              margin: '0.5rem 0 0',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}>
              Chargement de la salle…
            </p>
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=DM+Sans:wght@400&display=swap');
            @keyframes spinV { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      <Musee3dComponent onUnityLoaded={() => {
        setUnityReady(true);
        
      }} mode="Visitor" />
    </div>
  );
}