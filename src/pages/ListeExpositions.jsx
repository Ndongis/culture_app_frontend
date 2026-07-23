import React, { useState, useEffect } from "react";
import { Button, Accordion, ListGroup, Spinner } from "react-bootstrap";
import { Trash, BoxArrowInRight, PlusCircle } from "react-bootstrap-icons";
import axios from "axios";
import AddExpositionModal from "../modal/AddExpositionModal";
import AddSalleModal from "../modal/AddSalleModal";
import { useSalle } from "../component/context/SalleContext";
import { useNavigate } from "react-router-dom";

export default function NewExpositionButton() {
  const [showExpoModal, setShowExpoModal] = useState(false);
  const [showSalleModal, setShowSalleModal] = useState(false);
  const [selectedExpoId, setSelectedExpoId] = useState(null);
  const [expositions, setExpositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { salleId, setSalleId, expositionId, setExpositionId } = useSalle();

  // Charger toutes les expositions + salles depuis le microservice combiné
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8282/exposition/avec-salles");
      setExpositions(response.data);
    } catch (err) {
      console.error("Erreur chargement expositions avec salles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showExpoModal, showSalleModal]);

  useEffect(() => {
    if (salleId) setSalleId(null);
  }, []);

  const handleDeleteSalle = async (id, expoId) => {
    if (!window.confirm("Supprimer cette salle ?")) return;
    try {
      await axios.delete(`http://localhost:8383/salles/${id}`);
      setExpositions((prev) =>
        prev.map((expo) =>
          expo.id === expoId
            ? { ...expo, salles: expo.salles.filter((s) => s.id !== id) }
            : expo
        )
      );
    } catch (error) {
      console.error("Erreur suppression salle:", error);
    }
  };

  const versSalle = (expositionId, salleId) => {
    if (salleId != null) setSalleId(salleId);
    setExpositionId(expositionId);
    navigate("/");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Liste des expositions</h4>
        <Button variant="primary" onClick={() => setShowExpoModal(true)}>
          Nouvelle Exposition
        </Button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Accordion defaultActiveKey="0">
          {expositions.length === 0 ? (
            <p>Aucune exposition trouvée.</p>
          ) : (
            expositions.map((expo, index) => (
              <Accordion.Item eventKey={index.toString()} key={expo.id}>
                <Accordion.Header>
                  🖼️ {expo.nom} — {expo.description}
                </Accordion.Header>
                <Accordion.Body>
                  {expo.salles && expo.salles.length > 0 ? (
                    <ListGroup variant="flush">
                      <p style={{ fontWeight: "bold", fontSize: "18px" }}>Salles</p>
                      {expo.salles.map((salle) => (
                        <ListGroup.Item
                          key={salle.id}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>{salle.nom}</strong>{" "}
                            <span className="text-muted">
                              ({salle.modele_salle || "Modèle inconnu"})
                            </span>
                          </div>
                          <div>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2"
                              onClick={() => versSalle(expo.id, salle.id)}
                            >
                              <BoxArrowInRight /> Aller
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteSalle(salle.id, expo.id)}
                            >
                              <Trash /> Supprimer
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted">Aucune salle associée.</p>
                  )}

                  {/* ✅ Bouton Ajouter une salle */}
                  <div className="text-end mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => versSalle(expo.id, null)}
                    >
                      <PlusCircle /> Créer une nouvelle salle
                    </Button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))
          )}
        </Accordion>
      )}

      {/* Modales */}
      <AddExpositionModal
        show={showExpoModal}
        handleClose={() => setShowExpoModal(false)}
      />

      <AddSalleModal
        show={showSalleModal}
        handleClose={() => setShowSalleModal(false)}
        exposition_id={selectedExpoId}
      />
    </div>
  );
}
