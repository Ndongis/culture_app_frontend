import React, { useState,useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { CircleLoader } from "react-spinners";
import { useSalle } from "../component/context/SalleContext";


export default function AddSalleModal({ show, setShow, handleClose, exposition_id }) {
  const [nom, setNom] = useState("");
  const [modeleSalle, setModeleSalle] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const {salleId,setSalleId,expositionId}=useSalle()

  useEffect(() => {
    console.log("valeur mise à jour :", salleId);
  }, [salleId]);
  
  const handleSave = async () => {
    setLoading(true);
    console.log("expos " + exposition_id);
    const salleData = {
      nom,
      modele_salle: modeleSalle,
      exposition_id: exposition_id ? parseInt(exposition_id) : null,
      artiste_id: 1,
    };

    try {
      console.log(salleData.artiste_id);
      const res = await axios.post("http://localhost:8383/salles", salleData);
      alert("Salle ajoutée avec succès !");
setSalleId(res.data.id)
      console.log("valeur  ",salleId);
      

      setShow(false);
      console.log(res.data);

    
      // Réinitialiser le formulaire
      setNom("");

      setModeleSalle("");
      
      setArtisteId("");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l’enregistrement !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>Nouvelle Salle</Modal.Title>
      </Modal.Header>

      <Modal.Body
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        {loading ? (
          <CircleLoader color="#eb7434" size={60} />
        ) : modalContent ? (
          <div>
            <p>{modalContent.text}</p>
            <Button variant="primary" onClick={() => setModalContent(null)}>
              Continuer
            </Button>
          </div>
        ) : (
          <Form style={{ width: "100%" }}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom de la salle"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Modèle de salle</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom du modèle"
                value={modeleSalle}
                onChange={(e) => setModeleSalle(e.target.value)}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      {!modalContent && (
        <Modal.Footer>
          
         <Button variant="secondary" onClick={handleClose} hidden>
            Annuler
          </Button>
          
          <Button variant="success" onClick={handleSave}>
            Enregistrer
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
