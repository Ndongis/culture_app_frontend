import { useEffect, useState } from "react";
import "../../styles/PresentationSection.css";

import img1 from "../../assets/slider_images_login/image1.jpg";
import img2 from "../../assets/images_home/image3.png";
import img3 from "../../assets/images_home/image2.png";
import img4 from "../../assets/images_home/images.png";

const slides = [
  {
    image: img1,
    title: "L'art africain",
    text: "Découvrez les trésors du patrimoine africain à travers une expérience immersive permettant d'explorer les œuvres, leur histoire et leur importance culturelle."
  },
  {
    image: img2,
    title: "Une immersion virtuelle",
    text: "Naviguez librement dans des salles d'exposition en trois dimensions et rapprochez-vous des œuvres comme si vous étiez dans un véritable musée."
  },
  {
    image: img3,
    title: "Préserver notre héritage",
    text: "Notre plateforme contribue à la valorisation et à la transmission du patrimoine culturel grâce aux nouvelles technologies."
  }
];

// Doit correspondre à la durée de transition définie dans le CSS (.7s)
const TRANSITION_MS = 700;
const SLIDE_DURATION_MS = 6000;

export default function PresentationSection() {

    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {

        const timer = setInterval(() => {

            // 1. on lance le fondu de sortie
            setVisible(false);

            // 2. une fois la sortie terminée, on change de slide et on refait apparaître
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % slides.length);
                setVisible(true);
            }, TRANSITION_MS);

        }, SLIDE_DURATION_MS);

        return () => clearInterval(timer);

    }, []);

    return(

        <section className="presentation-section">

            <div className={`presentation-image${visible ? " visible" : ""}`}>

                <img
                    src={slides[index].image}
                    alt={slides[index].title}
                />

            </div>

            <div className={`presentation-text${visible ? " visible" : ""}`}>

                <h2>{slides[index].title}</h2>

                <p>
                    {slides[index].text}
                </p>

            </div>

        </section>

    )

}