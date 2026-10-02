import { useCallback, useEffect, useState } from 'react';

export function useCountdown(endTime: string) {
  const calculateRemaining = useCallback(
    () => Math.max(0, new Date(endTime).getTime() - Date.now()),
    [endTime],
  );
  const [remaining, setRemaining] = useState(calculateRemaining);
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(calculateRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateRemaining]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isExpired: remaining === 0 };
}
