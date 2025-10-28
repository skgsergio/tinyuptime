"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

interface ReloadContextValue {
  reloadDate: Date;
  triggerReload: () => void;
}

interface TimerDisplayValue {
  timeLeft: number;
  setTimeLeft: (timeLeft: number) => void;
}

const ReloadContext = createContext<ReloadContextValue | undefined>(undefined);
const TimerDisplayContext = createContext<TimerDisplayValue | undefined>(
  undefined,
);

export function useReload() {
  const context = useContext(ReloadContext);
  if (!context) {
    throw new Error("useReload must be used within a TimerProvider");
  }
  return context;
}

export function useTimerDisplay() {
  const context = useContext(TimerDisplayContext);
  if (!context) {
    throw new Error("useTimerDisplay must be used within a TimerProvider");
  }
  return context;
}

// Backward compatibility hook
export function useTimer() {
  const reloadContext = useContext(ReloadContext);
  const timerContext = useContext(TimerDisplayContext);

  if (!reloadContext || !timerContext) {
    throw new Error("useTimer must be used within a TimerProvider");
  }

  return {
    ...reloadContext,
    ...timerContext,
  };
}

interface TimerProviderProps {
  children: ReactNode;
  interval: number;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({
  children,
  interval,
}) => {
  const [reloadDate, setReloadDate] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState(interval);

  const triggerReload = useCallback(() => {
    setReloadDate(new Date());
    setTimeLeft(interval);
  }, [interval]);

  const reloadContextValue = useMemo(
    () => ({
      reloadDate,
      triggerReload,
    }),
    [reloadDate, triggerReload],
  );

  const timerDisplayContextValue = useMemo(
    () => ({
      timeLeft,
      setTimeLeft,
    }),
    [timeLeft, setTimeLeft],
  );

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
    <ReloadContext.Provider value={reloadContextValue}>
      <TimerDisplayContext.Provider value={timerDisplayContextValue}>
        {children}
      </TimerDisplayContext.Provider>
    </ReloadContext.Provider>
  );
};
