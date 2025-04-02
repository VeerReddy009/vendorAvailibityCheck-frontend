import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onAnimationComplete }) => {
  const [position, setPosition] = useState('centered');

  useEffect(() => {
    setTimeout(() => {
      // Move logo diagonally to the top-left corner
      setPosition('move-to-corner');

      // After moving, trigger fade out
      setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 1000); // Matches the transition duration
    }, 2000);
  }, [onAnimationComplete]);

  return (
    <div className="loading-screen">
      <div className={`loading-logo-container ${position}`}>
        <img 
          src="https://res.cloudinary.com/diqqos08s/image/upload/v1743523532/Screenshot_21_o5te9p.png"
          alt="Vendor Availability Logo"
          className="loading-logo"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
