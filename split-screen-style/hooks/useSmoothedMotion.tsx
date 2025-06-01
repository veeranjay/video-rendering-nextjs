// hooks/useSmoothedMotion.ts
import { useRef, useEffect, useState } from 'react';

export const useSmoothedMotion = (target: number, smoothness = 0.1) => {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const newVal = prevRef.current + (target - prevRef.current) * smoothness;
    prevRef.current = newVal;
    setValue(newVal);
  }, [target]);

  return value;
};
