export const supprimerPresentation=async (data) =>{
     // Envoi à Django
     try {
        const res = await fetch(
          `http://localhost:8080/api/delete_objet_from_file/`,
          {
            method: "DELETE",
            body: JSON.stringify({
              filename: "fichier.json",
              oeuvre_id: data.oeuvre_id,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const response = await res.json();
        console.log("✅ Suppression réussie :", response);
      } catch (error) {
        console.error("❌ Erreur d’envoi à Django :", error);
      }
}