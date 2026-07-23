import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Button,
  Form,
  Dropdown,
  Badge,
  CloseButton,
} from "react-bootstrap";
import axios from "axios";
import { CircleLoader } from "react-spinners";


export default function AddExpositionModal({ show, handleClose }) {
    
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  const [themes, setThemes] = useState([]);
  const [salles, setSalles] = useState(null);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null); // Contenu dynamique
  const [exposition,setExposition]=useState(null);
  const navigate = useNavigate();

  // Charger les thèmes depuis l'API
  useEffect(() => {
    axios
      .get("http://localhost:8484/themes")
      .then((res) => setThemes(res.data))
      .catch((err) => console.error("Erreur chargement thèmes:", err));
  }, []);

  const handleSelectTheme = (theme) => {
    if (!selectedThemes.find((t) => t.id === theme.id)) {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };

  const handleRemoveTheme = (themeId) => {
    setSelectedThemes(selectedThemes.filter((t) => t.id !== themeId));
  };

  const handleSave = async () => {
    setLoading(true);
    const backupNom = nom;
    const backupDescription = description;
    const backupThemes = [...selectedThemes];
    const user_id=1;

    try {
      
      // Créer l'exposition
      const expoResponse = await axios.post("http://localhost:8282/expositions", {
        nom,
        description,
        user_id
      });

      const expositionId = expoResponse.data.id;
      setExposition(expoResponse.data);
      console.log("Ajout de l'exposition");
      // Lier les thèmes
      for (const theme of selectedThemes) {
        await axios.post("http://localhost:8282/expositions_themes", {
          exposition: expositionId,
          theme_id: theme.id,
        });
      }

      // Mise à jour du contenu du modal
      setModalContent({
        text: "Exposition enregistrée avec succès !",
        exposition: expoResponse.data,
      });

      // Reset des champs pour le prochain ajout
      setNom("");
      setDescription("");
      setSelectedThemes([]);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l’enregistrement !");
      // Revenir à l'état initial si erreur
      setNom(backupNom);
      setDescription(backupDescription);
      setSelectedThemes(backupThemes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Nouvelle Exposition</Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        {loading ? (
          <CircleLoader color="#eb7434" size={60} />
        ) : modalContent ? (
          <div>
            <p>{modalContent.text}</p>
            <Button variant="primary" onClick={() =>{
                setSalleId(salle_id_param);
                setExpositionId(exposition_id_param);
                navigate("/",{
                    state: { salle_id_param: null, exposition_id_param:exposition.id},
                  });
            }}>
              Continuer
            </Button>
          </div>
        ) : (
          <Form style={{ width: "100%" }}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom de l'exposition"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Choisir des thèmes</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="secondary">
                  Sélectionner un thème
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {themes.map((theme) => (
                    <Dropdown.Item
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme)}
                    >
                      {theme.nom}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>

            <div className="mt-3 d-flex flex-wrap gap-2">
              {selectedThemes.map((theme) => (
                <Badge
                  key={theme.id}
                  bg="info"
                  className="p-2 d-flex align-items-center"
                  style={{ fontSize: "1.2rem" }}
                >
                  {theme.nom}
                  <CloseButton
                    className="ms-2"
                    variant="white"
                    onClick={() => handleRemoveTheme(theme.id)}
                    style={{
                      width: "1.8rem",
                      height: "1.8rem",
                      border: "2px solid white",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  />
                </Badge>
              ))}
            </div>
          </Form>
        )}
      </Modal.Body>

      {!modalContent && (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
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
