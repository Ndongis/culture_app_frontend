import Expositions from "../component/layout/Expositions";
import SliderPanel from "../component/layout/SliderPanel";

import img1 from "../assets/slider_images_login/image1.jpg";
import img2 from "../assets/slider_images_login/image2.jpg";
import img3 from "../assets/slider_images_login/image3.jpg";
import img4 from "../assets/images_home/images.png";
import "../styles/accueil.css";
import PresentationSection from "../component/layout/PresentationSection";

export default function Accueil() {
  const sliderImages = [img1, img2, img3, img4];

  const sliderCaptions = [
    {
      title: "Découvrir la culture",
      artist: "Marie Leclerc",
      year: "2023",
    },
    {
      title: "Entrez dans un monde",
      artist: "Paul Renard",
      year: "2022",
    },
    {
      title: "Immersivité totale",
      artist: "Naviguer dans des salles virtuelles",
      year: "2024",
    },
    {
      title: "La création des sénégalais",
      artist: "à portée de main",
      year: "2021",
    },
  ];

  return (
    <>
     
          <PresentationSection />
      <main className="main-content">
        <Expositions isVisitePage={true}
          titreExpo="Expositions Artistiques"
          expositionUrl="?type_exposition=artistique"
        />

        <Expositions
         isVisitePage={true}
          titreExpo="Expositions Historiques"
          expositionUrl="?type_exposition=historique"
        />
      </main>
    </>
  );
}