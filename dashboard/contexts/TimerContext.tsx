'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface TimerContextValue {
  timeLeft: number;
  setTimeLeft: (timeLeft: number) => void;
  reloadDate: Date;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}

interface TimerProviderProps {
  children: ReactNode;
  interval: number;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children, interval }) => {
  const [reloadDate, setReloadDate] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState(interval);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          setReloadDate(new Date());
          return interval;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <TimerContext.Provider value={{ timeLeft, setTimeLeft, reloadDate }}>
      {children}
    </TimerContext.Provider>
  );
};
