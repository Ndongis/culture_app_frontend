import React, { useState, useEffect } from 'react';
import '../styles/Hero.css';
;

const slidesData = [
  { id: 1, targetValue: 3, suffix: "M", label: "User worldwide", progress: 30 },
  { id: 2, targetValue: 1000, suffix: "", label: "Transactions per day", progress: 65 },
  { id: 3, targetValue: 70, suffix: "%", label: "Average users saved", progress: 100 },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);

  const currentSlide = slidesData[currentIndex];

  // 1. Changement automatique de slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesData.length);
    }, 3500); // Temps de pause sur chaque slide
    return () => clearInterval(interval);
  }, []);

  // 2. Animation du compteur (0 vers targetValue)
  useEffect(() => {
    const endValue = currentSlide.targetValue;
    const duration = 800; // Durée de l'animation des chiffres en ms
    const startTime = performance.now();

    const animateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Effet "Ease Out" pour ralentir à la fin du compteur
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOutProgress * endValue);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animateCount);
  }, [currentIndex, currentSlide.targetValue]);

  // 3. Calculs pour l'arc SVG
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  // Calcul exact du remplissage
  const strokeDashoffset = halfCircumference - (currentSlide.progress / 100) * halfCircumference;

  return (
    <div className="carousel-container">
      <div className="carousel-badge">THE NUMBER TALKS</div>

      {/* Petit trait vertical sous le badge (visible dans ta vidéo) */}
      <div className="vertical-line"></div>

      <div className="carousel-content">
        <svg className="carousel-svg" viewBox="0 0 200 100">
          {/* Arc pointillé d'arrière-plan */}
          <path
            d="M 10,100 A 90,90 0 0,1 190,100"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* Arc bleu de progression */}
          <path
            d="M 10,100 A 90,90 0 0,1 190,100"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeLinecap="round" /* Bout arrondi comme sur la vidéo */
            strokeDasharray={`${halfCircumference} ${halfCircumference}`}
            strokeDashoffset={strokeDashoffset}
            className="progress-arc"
          />
        </svg>

        {/* Le texte avec le compteur animé */}
        <div className="carousel-text-group" key={`text-${currentIndex}`}>
          <h1 className="carousel-value">
            {displayValue}{currentSlide.suffix}
          </h1>
          <p className="carousel-label">{currentSlide.label}</p>
        </div>
      </div>

      <div className="carousel-dots">
        {slidesData.map((slide, index) => (
          <button
            key={slide.id}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}