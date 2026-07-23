import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SliderPanel({ images = [], captions = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="slider-panel">
      {images.map((img, i) => (
        <motion.img
          key={i}
          src={img}
          className="slider-img"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === i ? 1 : 0 }}
          transition={{ duration: 1.4 }}
          alt=""
        />
      ))}
      
      <div className="slider-overlay" />
      
      <div className="slider-caption">
        <AnimatePresence mode="wait">
          {captions[index] && (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
            >
              <div className="caption-title">{captions[index].title}</div>
              <div className="caption-sub">
                {captions[index].artist} &mdash; {captions[index].year}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="caption-dots">
          {images.map((_, i) => (
            <div key={i} className={`dot${index === i ? " active" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}