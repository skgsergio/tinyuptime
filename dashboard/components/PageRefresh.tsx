'use client';

import { useState, useEffect } from 'react';

const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function PageRefresh() {
  const [timeLeft, setTimeLeft] = useState(REFRESH_INTERVAL);

  useEffect(() => {
    // Set up the countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          // Reload the page when countdown reaches 0
          window.location.reload();
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format the time left as minutes and seconds
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <span className="text-sm text-gray-300 bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full font-mono">
      Refreshing in {formattedTime}
    </span>
  );
} 