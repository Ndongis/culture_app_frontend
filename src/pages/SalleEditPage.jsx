import React, { useEffect, useState } from "react";

import axios from "axios";
import { ButtonToolbar, Dropdown } from "react-bootstrap";
import "./SalleEditPage.css";
import Button from "react-bootstrap/Button";
import Musee3dComponent from "../component/Musee3DComponent";
import ReactLoading from "react-loading";
import { ClipLoader, RotateLoader, ScaleLoader } from "react-spinners";
import AddSalleModal from "../modal/AddSalleModal";
import { useLocation } from "react-router-dom";
import BiensModal from "../modal/BiensModal";
import { SalleProvider, useSalle } from "../component/context/SalleContext";
import { AuthContext } from "../component/context/AuthContext"; // adapte le chemin
import { useContext } from "react";

import {

  permutationReussie,
  presentationReussi,
  suppressionReussie,
  UpdateOeuvreToUnity,
} from "../fonctions/sendToUnityFonctions";
import ModeleSalle from "../component/layout/ModeleSalle";

// ── Hook URL signée Supabase (régénération automatique) ──────────────────────
const useSignedUrl = (key) => {
  const [url, setUrl] = useState(null);


  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    const fetchUrl = async () => {
      try {
        const res = await fetch(`${apiUrl}${biensEndpoint}/api/get_signed_url/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key })
        });
        const data = await res.json();
        if (!cancelled) setUrl(data.signed_url);
      } catch (err) {
        console.error("❌ Erreur get_signed_url :", err);
      }
    };

    fetchUrl();
    // Régénère automatiquement toutes les 6h (avant expiration 7 jours)
    const interval = setInterval(fetchUrl, 6 * 60 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [key]);

  return url;
};


// ── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BoxIcon = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const SwitchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);


export default function SalleEditPage() {
  const [showModal, setShowModal] = useState(false);
  const [biens, setBiens] = useState([]);
  const [unityReady, setUnityReady] = useState(false);
  const [transitionOut, setTransitionOut] = useState(false);
  const [transitionGone, setTransitionGone] = useState(false);
  const transitionImage = typeof window !== 'undefined' ? localStorage.getItem('salle_transition_image') : null;
  const transitionNom   = typeof window !== 'undefined' ? (localStorage.getItem('salle_transition_nom') || '') : '';
  const [biensLoaded, setBiensLoaded] = useState(false);
  const [salle, setSalle] = useState(null);
  const { salleId, setSalleId, expositionId, setExpositionId, loading } = useSalle();
  const artiste_id = 1;

  const { user, loadingUser } = useContext(AuthContext);

  const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const biensEndpoint = import.meta.env.VITE_BIENS_ENDPOINT;
  const exposEndpoint=import.meta.env.VITE_EXPO_ENDPOINT;
  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Vous n'êtes pas connecté</p>;

  const [modals, setModals] = useState({
    AddSalle: false,
    BiensList: false,
    ChangeSalle: false,
  });

  // ── States pour le modal de changement de salle ────────────────────────────
  const [sallesExposition, setSallesExposition] = useState([]);
  const [sallesLoading, setSallesLoading] = useState(false);
  const [selectedBien, setSelectedBien] = useState(null); // Pour afficher les détails d'une œuvre
 const [pos, setPos] = useState({ x: 0, y: 0 });
   const [visible, setVisible] = useState(false);
  const handleShow = (modalName) => {
    if (modalName === 'ChangeSalle') {
      fetchSallesExposition();
    }
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleClose = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    if (modalName === 'ChangeSalle') {
      setSelectedBien(null);
    }
  };

  // ── Fetch salles de l'exposition ───────────────────────────────────────────
  const fetchSallesExposition = async () => {
    setSallesLoading(true);
    try {
      const res = await axios.get(
  `${apiUrl}${exposEndpoint}/api/get_salles_and_modele/by_exposition/${expositionId}/`,
  {
    withCredentials: true
  }
);

      setSallesExposition(res.data);
    } catch (err) {
      console.error("Erreur fetchSallesExposition :", err);
      setSallesExposition([]);
    }
    setSallesLoading(false);
  };

  // ── Changer de salle ───────────────────────────────────────────────────────
  const handleChangeSalle = (newSalleId) => {
    if (newSalleId === salleId) return; // Ne pas changer si c'est la salle courante
    
    setSalleId(newSalleId);
    setBiensLoaded(false);
    
    handleClose('ChangeSalle');
    
    // Recharger les œuvres de la nouvelle salle
    const loadNewSalleBiens = async () => {
      try {
        const res = await axios.get(`${apiUrl}${biensEndpoint}/api/bien/salle/${newSalleId}`);
        setBiens(res.data);
        setBiensLoaded(true);
        setUnityReady(true);
      } catch (err) {
        console.error("Erreur chargement œuvres nouvelle salle :", err);
        setBiens([]);
        setBiensLoaded(true);
      }
    };
    loadNewSalleBiens();
  };

  const location = useLocation();

   useEffect(() => {
  const preventZoomKeys = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (["+", "=", "-", "0"].includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  window.addEventListener("keydown", preventZoomKeys);
  return () => window.removeEventListener("keydown", preventZoomKeys);
}, []);

  
  //console.log("vale " + salleId );
  useEffect(() => {
    const loadBiens = async () => {
      console.log("loading...");
      const data = await fetchBiens();
      setBiens(data);
      setBiensLoaded(true);
    };

    loadBiens();
  }, []);
  useEffect(() => {
    if (loading) return; // ⛔ attendre backend

    if (salleId == null) {
      setModals((prev) => ({ ...prev, AddSalle: true }));
    }

    console.log("valeur mise à jour :", salleId);
    console.log("valeur mise à jour :", expositionId);

  }, [salleId, expositionId, loading]);

  useEffect(() => {
    if (unityReady) {
      console.log("✅ Unity est prêt !");
      // Ici tu peux lancer d'autres actions après le chargement de Unity
    }
  }, [unityReady]);

  useEffect(() => {
    window.SendDataSceneToReact = async (jsonData) => {
      const data = JSON.parse(jsonData);
      console.log("Données Unity reçues :", data);

      //Enregistrer la scéne
      // Envoi à Django
      try {
        const res = await fetch(`${apiUrl}${biensEndpoint}/api/save_scene/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: data,
          }),
        });
        const response = await res.json();
        console.log(response.data);
      } catch (error) {
        console.error("❌ Erreur d’envoi à Django :", error);
      }
    };
  }, []);

  useEffect(() => {
    //Envoie des donnees vers unity pour ajouter les informations de la scene
    window.SendDataSceneToReactForAddBien = async (jsonData) => {
      const data = JSON.parse(jsonData);
      console.log("Données Unity reçues :", data.bien_id);

      try {
        const res = await fetch(
          `${apiUrl}${biensEndpoint}/api/add_objet_in_file`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              artiste_id: user.id,
              filename:
                
                "salle_" +
                salleId +
                ".json",

              // 🔥 on envoie TOUT le json unity
              bien_data: data,
              
            }),
          }
        );
        console.log()
        const response = await res.json();
        console.log("✅ Sauvegarde réussie :", response);

        //Enregister dans la table d'association oeuvres_salles
        //Enregistrer le bien présenté dans la salle
        const formData = new FormData();
        formData.append("salle_id", salleId);
        formData.append("bien_id", data.bien_id);
        console.log("salle " + salleId + " " + data.bien_id);

        const res1 = await axios.post(
          `${apiUrl}${biensEndpoint}/api/bien/salle`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        //Verifier si la presentation est bien faite
        if (res1.status == 200){
alert("Le bien culturel est maintenant présenté dans le musée");

 const biens = await fetchBiens();
 setBiens(biens);
        }
          
        else if (res1.status == 400) {
          alert(res1.data.error);
        }
        console.log(response.data);
        presentationReussi(response.data);
        loadBiens();
        setShow(false);
        console.log("✅ Sauvegarde réussie :", response);
      } catch (error) {
        console.error("❌ Erreur d’envoi à Django :", error);
      }
    };
  }, [salleId]);

  useEffect(() => {
    //Envoie des donnees vers unity pour ajouter les informations de la scene
    window.SendForUpdateBienData= async (jsonData) => {
      const data = JSON.parse(jsonData);
      console.log("Données Unity reçues :", data.bien_id);

      try {
        const res = await fetch(
          `${apiUrl}${biensEndpoint}/api/update_objet_in_file`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
       
              filename:
                
          
                
                "salle_" +
                salleId +
                ".json",

              // 🔥 on envoie TOUT le json unity
              bien_data: data,
              bien_id:data.bien_id
            }),
          }
        );

        const response = await res.json();
        console.log("✅ Mise à jour réussie :", response);
        alert("Le bien culturel est maintenant mis à jour dans la galerie");
       
        console.log(response.data);
    
      } catch (error) {
        console.error("❌ Erreur d’envoi à Django :", error);
      }
    };
  }, [salleId]);

  
  useEffect(() => {
    //Envoie des donnees vers unity pour ajouter les informations de la scene
    window.SendForUpdateAllBiensData= async (jsonData) => {
      const data = JSON.parse(jsonData);
      console.log("Données Unity reçues :", data.data);

      try {
        const res = await fetch(
          `${apiUrl}${biensEndpoint}/api/reset_and_add_biens/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              artiste_id: artiste_id,
              filename:
                
           
                
                "salle_" +
                salleId +
                ".json",

              // 🔥 on envoie TOUT le json unity
              biens: data.data,
            }),
          }
        );

        const response = await res.json();
        console.log("✅ Mise à jour réussie :", response);
        alert("Tous les biens culturels sont mis à jour dans la galerie");
       
        console.log(response.data);
    
      } catch (error) {
        console.error("❌ Erreur d’envoi à Django :", error);
      }
    };
  }, [salleId]);

  //Afficher la page présentation d'un bien
  useEffect(() => {
    window.showBiensListModal = async () => {
      console.log("showBiensListModal appelé");
      handleShow("BiensList");
    };
  });

  useEffect(() => {
    window.annulerPresentation = async (jsonData) => { };
  });

  //Pour supprimer le bien de la salle
  useEffect(() => {
    window.SendDataSceneToReactForDeleteBien = async (jsonData) => {
      console.log(jsonData);
      const bien_id = jsonData;
      console.log("Données Unity reçues pour suppression : ", bien_id);

      // Envoi à Django
      try {
        const res = await fetch(
          `${apiUrl}${biensEndpoint}/api/delete_objet_from_file`,
          {
            method: "DELETE",
            body: JSON.stringify({
              filename:    
                
                "salle_" +
                salleId +
                ".json",

              artiste_id: 1,
              bien_id: bien_id,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const response = await res.json();

        console.log("✅ Suppression réussie :", response);
        const formData = new FormData();
        formData.append("salle_id", salleId);
        formData.append("bien_id", bien_id);

        const res1 = await axios.delete(
          `${apiUrl}${biensEndpoint}/api/remove_bien_from_salle`,
          { data: {
      bien_id: bien_id,
    },
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("res1 " + res1.status+" res "+res.status);
        console.log(res1);
        //Verifier si la presentation est bien faite
        if (res1.status == 200 && res.status==200) {
          alert(res1.data.message);
          const biens = await fetchBiens();
          setBiens(biens);
          //suppressionReussie();
        }

        else if (res1.status == 400) {
          alert(res1.data.error);
        }

      } catch (error) {
        console.error("❌ Erreur d’envoi à Django :", error);
      }
    };
  }, []);

  //Pour supprimer le bien de la salle
  useEffect(() => {
    window.SendDataSceneToReactForPermuteBien = async (jsonData) => {
      console.log(jsonData);
      const data = JSON.parse(jsonData);
      console.log("Données Unity reçues :", data);

      // Envoi à Django
      try {
        const res = await fetch(
          `${apiUrl}${biensEndpoint}/api/permute_objets_in_file/`,
          {
            method: "PUT",
            body: JSON.stringify({
              filename:
                
                
                "salle_" +
                salleId +
                ".json",

              artiste_id: 1,
              bien1_id: data.object1.bien_id,
              bien2_id: data.object2.bien_id
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const response = await res.json();

        console.log("✅ Permutation réussie :", response);

        //Verifier si la presentation est bien faite
        if (res.status == 200) {
          alert(response.message);
          permutationReussie();
        }

        else if (res.status == 400) {
          alert(res.data.error);
        }

      } catch (error) {
        console.error("❌ Erreur d’envoi à Django :", error);
      }
    };
  }, []);

  async function checkSceneFile(filename) {
    try {
      const response = await fetch(
        `${apiUrl}${biensEndpoint}/api/get_scene`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artiste_id: artiste_id,
          filename:
           
            "salle_" +
            salleId +
            ".json",
        }),
      }

      );

      if (response.status === 404) {
        console.log("❌ Fichier introuvable :", filename);
        return null;
      }

      const result = await response.json();

      if (result.exists) {
        console.log("✅ Fichier trouvé !");
        console.log("Contenu JSON :", result.data);
        return result.data;
      } else {
        console.log("❌ Le fichier n'existe pas !");
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du fichier :", error);
      return null;
    }
  }
  const handleMove = (e) => {
  console.log(e.clientX, e.clientY); // 👈 doit spam dans la console
  setPos({ x: e.clientX, y: e.clientY });
};

  useEffect(() => {
    const sendToUnity = async () => {
      if (unityReady && biensLoaded && window.unityInstance) {
        console.log("🚀 Envoi des œuvres à Unity !");

        const payload = JSON.stringify({ biens: biens });
        console.log("payload", payload);
        console.log("salleId", salleId);
        console.log("expositionId", expositionId);
        
        const res1 = await axios.get(`${apiUrl}${exposEndpoint}/api/get_salle_and_modele/${salleId}/`);
        
        const salle=res1.data;

        window.unityInstance.SendMessage("PositionController","SetPosition",salle.modele_salle.nom);

        // Chargement du fichier scène
        const sceneData = await checkSceneFile(
          
          "salle_" +
          salleId +
          ".json");
        console.log("Data", sceneData);

        if (sceneData != null) {

          window.unityInstance.SendMessage(
            "BienController",
            "receiveAllBiens",
            payload
          );

          window.unityInstance.SendMessage(
            "BienController",
            "initGalerieObjets",
            JSON.stringify(sceneData)
          );
        }
      }
    };

    sendToUnity();
  }, [unityReady, biensLoaded]);

  const fetchBiens = async () => {
    try {
      const res = await axios.get(`${apiUrl}${biensEndpoint}/api/bien/salle/${salleId}`);
      console.log("Résultat du fetch :", res.data);
      return res.data;
    } catch (err) {
      console.error("Erreur fetchBiens :", err);
      return [];
    }
  };


  useEffect(() => {
    const canvas = document.getElementById("unity-canvas");

    const disableCanvas = () => {
      if (canvas) {
        canvas.style.pointerEvents = "none";
        canvas.blur();
      }
    };

    const enableCanvas = () => {
      if (canvas) {
        canvas.style.pointerEvents = "auto";
      }
    };

    const handleFocusIn = (e) => {
      const tag = e.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") {
        disableCanvas();
      }
    };

    const handleFocusOut = () => {
      enableCanvas();
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const handleImageChange = (e, bienId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Crée une URL unique pour cet œuvre
    const previewUrl = URL.createObjectURL(file);

    setBiens((prevBiens) =>
      prevBiens.map((b) =>
        b.id === bienId ? { ...b, image: previewUrl, _file: file } : b
      )
    );
  };

  function initMusee() {
    console.log("✅ Unity chargé !");
  }
  const handleSubmit = (bien) => {
    const formData = new FormData();
    for (const key in bien) {
      if (key !== "_file" && key !== "image" && bien[key]) {
        formData.append(key, bien[key]);
      }
    }

    if (bien._file) {
      formData.append("image", bien._file);
    }

    const isNew = !bien.id;
    const url = isNew
      ? `${apiUrl}${biensEndpoint}/api/biens`
      : `${apiUrl}${biensEndpoint}/api/biens/${bien.id}`;
    const method = bien.id ? "put" : "post"; // ou 'put' si tu veux la mise à jour réelle

    axios[method](url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        alert(isNew ? "Bien créé" : "Bien mis à jour");
        console.log(res.data);
        bien = res.data;

        fetchBiens();
      })
      .catch((err) => {
        console.error(err);
        alert("Erreur lors de l’enregistrement");
      });
  };

  const handleDelete = (index, id) => {
    console.log(biens[index]);
    if (window.confirm("Supprimer ce bien culturel ?")) {
      if (biens[index].id == undefined) {
        alert("À supprimer");
      } else
        axios
          .delete(`${apiUrl}${biensEndpoint}/api/biens/${id}`)
          .then(() => {
            alert("Bien supprimé");
            const payload = JSON.stringify({ bien_id: id });
            console.log("id react " + id);
            if (window.unityInstance) {
              // unityInstance est créé par WebGL
              window.unityInstance.SendMessage(
                "BienController", // nom du GameObject dans Unity
                "supprimerBien", // méthode C# à appeler
                payload // string JSON
              );
            }
            fetchBiens();
          })
          .catch((err) => {
            console.error(err);
            alert("Erreur lors de la suppression");
          });
    }
  };

  const handleNewBien = () => {
    const tempBien = {
      id: undefined,
      titre: "",
      auteur: "",
      date: "",
      technique: "",
      sujet: "",
      description_visuelle: "",
      inscription: "",
      historique: "",
      image: "",
      _file: null,
    };
    setBiens((prev) => [tempBien, ...prev]);
  };

  return (
    <>
      {/* ── Transition plein écran ── */}
      {!transitionGone && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          overflow: 'hidden',
          opacity: transitionOut ? 0 : 1,
          transition: transitionOut ? 'opacity 1s cubic-bezier(0.4,0,0.2,1)' : 'none',
          pointerEvents: transitionOut ? 'none' : 'all',
        }}>
          {/* Image avec animation zoom continu */}
          {transitionImage ? (
            <img
              src={transitionImage}
              alt={transitionNom}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                animation: transitionOut ? 'none' : 'zoomSlow 8s ease-in-out forwards',
                transform: transitionOut ? 'scale(1.12)' : undefined,
                transformOrigin: 'center center',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#0d0d0d' }} />
          )}

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
          }} />

          {/* Spinner */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.15)',
              borderTop: '2px solid rgba(255,255,255,0.9)',
              animation: 'spinLoader 0.85s linear infinite',
            }} />
          </div>

          {/* Texte bas droite */}
          <div style={{
            position: 'absolute', bottom: '3rem', right: '3.5rem',
            textAlign: 'right',
            opacity: transitionOut ? 0 : 1,
            transform: transitionOut ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            {transitionNom && (
              <p style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 600, fontStyle: 'italic',
                color: '#fff', margin: 0, lineHeight: 1.15,
                textShadow: '0 2px 30px rgba(0,0,0,0.55)',
                letterSpacing: '-0.01em',
              }}>
                {transitionNom}
              </p>
            )}
            <p style={{
              fontFamily: 'sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              margin: '0.5rem 0 0',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              Chargement de la salle…
            </p>
          </div>

          <style>{`
            @keyframes zoomSlow {
              0%   { transform: scale(1);    }
              100% { transform: scale(1.18); }
            }
            @keyframes spinLoader {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <style>{`
        /* ── Bien Cards ── */
        .bien-cards-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          max-height: calc(100vh - 220px);
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .bien-card {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 0.75rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .bien-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          border-color: #eb7434;
        }

        .bien-card-image {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .bien-card-image-placeholder {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .bien-card-info {
          flex: 1;
          margin-left: 1rem;
          min-width: 0;
        }

        .bien-card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bien-card-author {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
        }

        .bien-card-eye {
          padding: 0.5rem;
          border-radius: 50%;
          background: #f3f4f6;
          color: #666;
          transition: all 0.2s;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .bien-card:hover .bien-card-eye {
          background: #eb7434;
          color: white;
        }

        /* ── Header Actions ── */
        .dropdown-header-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .btn-change-salle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-change-salle:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-mes-oeuvres {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #eb7434;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-mes-oeuvres:hover {
          background: #d4682e;
        }

        .btn-add-bien {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 2px solid #1a1a1a;
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          color: #1a1a1a;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-bien:hover {
          background: #1a1a1a;
          color: white;
        }

        /* ── Modal Change Salle ── */
        .modal-overlay-custom {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-box-custom {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          width: 600px;
          max-width: 95vw;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .modal-header-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-title-custom {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .modal-close-btn {
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: #e5e7eb;
        }

        /* ── Salles Grid ── */
        .salles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .salle-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s;
          border: 3px solid transparent;
        }

        .salle-grid-item:hover:not(.current) {
          background: #eef2ff;
          border-color: #6366f1;
          transform: translateY(-3px);
        }

        .salle-grid-item.current {
          background: #e0e7ff;
          border-color: #6366f1;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .salle-grid-icon {
          color: #6366f1;
          margin-bottom: 0.75rem;
        }

        .salle-grid-item.current .salle-grid-icon {
          color: #4f46e5;
        }

        .salle-grid-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: #1a1a1a;
          text-align: center;
          margin: 0;
        }

        .salle-grid-current-badge {
          font-size: 0.7rem;
          background: #6366f1;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
          margin-top: 0.5rem;
        }

        .salles-loading {
          text-align: center;
          padding: 3rem;
          color: #888;
        }

        .salles-empty {
          text-align: center;
          padding: 3rem;
          color: #888;
        }

        /* ── Bien Detail Modal ── */
        .bien-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bien-detail-modal {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          width: 500px;
          max-width: 95vw;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .bien-detail-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .bien-detail-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.5rem;
        }

        .bien-detail-author {
          font-size: 1rem;
          color: #666;
          margin: 0 0 1rem;
        }

        .bien-detail-field {
          margin-bottom: 0.75rem;
        }

        .bien-detail-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }

        .bien-detail-value {
          font-size: 0.95rem;
          color: #333;
        }

        .bien-detail-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .bien-detail-btn {
          flex: 1;
          padding: 0.7rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bien-detail-btn.primary {
          background: #eb7434;
          border: none;
          color: white;
        }

        .bien-detail-btn.primary:hover {
          background: #d4682e;
        }

        .bien-detail-btn.danger {
          background: #ef4444;
          border: none;
          color: white;
        }

        .bien-detail-btn.danger:hover {
          background: #dc2626;
        }

        .bien-detail-btn.secondary {
          background: transparent;
          border: 2px solid #ccc;
          color: #666;
        }

        .bien-detail-btn.secondary:hover {
          border-color: #999;
          color: #333;
        }
      `}</style>

      <div className="museum-container">
        <div className="unity-column">

          {salleId && (
            <Musee3dComponent onUnityLoaded={() => {
              setUnityReady(true);
              setTransitionOut(true);
              setTimeout(() => {
                setTransitionGone(true);
                localStorage.removeItem('salle_transition_image');
                localStorage.removeItem('salle_transition_nom');
              }, 1100);
            }} mode="Editor" />
          )}
        </div>

        <div className="dropdown-column">
          
          <div className="dropdown-header-actions">
            <button className="btn-change-salle" onClick={() => handleShow("ChangeSalle")}>
              <SwitchIcon /> Changer de salle
            </button>
            <button className="btn-mes-oeuvres" onClick={() => handleShow("BiensList")}>
              Mes biens culturels
            </button>
            
          </div>

          <div className="bien-cards-container">
            {biens && biens.length > 0 ? (
              biens.map((bien, index) => (
                <div 
                  key={bien.id || `new-${index}`} 
                  className="bien-card"
                  onClick={() => setSelectedBien(bien)}
                >
                  {bien.image ? (
                    <img
                      src={
                        bien.image?.startsWith("blob:")
                          ? bien.image
                          : `${bien.image}`
                      }
                      alt={bien.titre}
                      className="bien-card-image"
                    />
                  ) : (
                    <div className="bien-card-image-placeholder">
                      <BoxIcon size={28} />
                    </div>
                  )}
                  <div className="bien-card-info">
                    <p className="bien-card-title">{bien.titre || "Sans titre"}</p>
                    <p className="bien-card-author">{bien.auteur || "Auteur inconnu"}</p>
                  </div>
                  <div className="bien-card-eye">
                    <EyeIcon />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
                Aucune œuvre dans cette salle
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Changer de Salle ── */}
      {modals.ChangeSalle && (
        <div className="modal-overlay-custom" onClick={() => handleClose("ChangeSalle")}>
          <div className="modal-box-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h2 className="modal-title-custom">Changer de salle</h2>
              <button className="modal-close-btn" onClick={() => handleClose("ChangeSalle")}>
                <CloseIcon />
              </button>
            </div>

            {sallesLoading ? (
              <div className="salles-loading">
                <RotateLoader color="#6366f1" size={10} />
                <p style={{ marginTop: "1rem" }}>Chargement des salles...</p>
              </div>
            ) : sallesExposition.length === 0 ? (
              <div className="salles-empty">
                <BoxIcon size={48} />
                <p style={{ marginTop: "1rem" }}>Aucune salle dans cette exposition</p>
              </div>
            ) : (
              <div className="salles-grid">
                {sallesExposition.map((salle) => (
                  <div
                    key={salle.id}
                    className={`salle-grid-item ${salle.id === salleId ? 'current' : ''}`}
                    onClick={() => handleChangeSalle(salle.id)}
                  >
                    <div className="salle-grid-icon">
                      <BoxIcon size={40} />
                    </div>
                    <p className="salle-grid-name">{salle.nom}</p>
                    {salle.id === salleId && (
                      <span className="salle-grid-current-badge">Salle actuelle</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── Modal Détail Bien ── */}
      {selectedBien && (
        <div className="bien-detail-overlay" onClick={() => setSelectedBien(null)}>
          <div className="bien-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h2 className="modal-title-custom">Détail de l'œuvre</h2>
              <button className="modal-close-btn" onClick={() => setSelectedBien(null)}>
                <CloseIcon />
              </button>
            </div>

            {selectedBien.image && (
              <img
                src={
                  selectedBien.image?.startsWith("blob:")
                    ? selectedBien.image
                    : `${selectedBien.image}`
                }
                alt={selectedBien.titre}
                className="bien-detail-image"
              />
            )}

            <h3 className="bien-detail-title">{selectedBien.titre || "Sans titre"}</h3>
            <p className="bien-detail-author">{selectedBien.auteur || "Auteur inconnu"}</p>

            {selectedBien.date && (
              <div className="bien-detail-field">
                <p className="bien-detail-label">Date</p>
                <p className="bien-detail-value">{selectedBien.date}</p>
              </div>
            )}

            {selectedBien.technique && (
              <div className="bien-detail-field">
                <p className="bien-detail-label">Technique</p>
                <p className="bien-detail-value">{selectedBien.technique}</p>
              </div>
            )}

            {selectedBien.sujet && (
              <div className="bien-detail-field">
                <p className="bien-detail-label">Sujet</p>
                <p className="bien-detail-value">{selectedBien.sujet}</p>
              </div>
            )}

            {selectedBien.description_visuelle && (
              <div className="bien-detail-field">
                <p className="bien-detail-label">Description visuelle</p>
                <p className="bien-detail-value">{selectedBien.description_visuelle}</p>
              </div>
            )}

            {selectedBien.historique && (
              <div className="bien-detail-field">
                <p className="bien-detail-label">Historique</p>
                <p className="bien-detail-value">{selectedBien.historique}</p>
              </div>
            )}

          </div>
        </div>
      )}

      <AddSalleModal
        show={modals.AddSalle}
        setShow={(value) => setModals((prev) => ({ ...prev, AddSalle: value }))}
        handleClose={() => handleClose("AddSalle")}
        exposition_id={expositionId}
      />
      <BiensModal
        show={modals.BiensList}
        setShow={(value) =>
          setModals((prev) => ({ ...prev, BiensList: value }))
        }
        handleClose={() => handleClose("BiensList")}
        biens={biens}
        onSave={handleSubmit}
        onDelete={handleDelete}
        onAdd={handleNewBien}
      />
      
    </>
  );
  
}