import { useEffect, useState, useCallback } from 'react';
import { delayRender, continueRender, cancelRender, watchStaticFile, staticFile } from 'remotion';

import { AnimationType } from '../components/AnimatedInfographics';

export type InfographicItem = {
  startMs: number;
  durationMs: number;
  uri: string;
  type:'video' | 'image' | 'text';
  animation: AnimationType;
}


export const useInfographics = (fileName: string) => {
    const [infographics, setInfographics] = useState<InfographicItem[] | null> (null);

  const [handle] = useState(()=> delayRender());

  const fetchInfographics = useCallback(async () => {
    try {
      const res = await fetch(staticFile(fileName));
      const data = (await res.json()) as InfographicItem[];
      setInfographics(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [fileName, handle]);


  useEffect(() => {
    fetchInfographics();

    const watcher = watchStaticFile(fileName, () => {
      fetchInfographics();
    });

    return () => {
      watcher.cancel();
    };
  }, [fetchInfographics, fileName]);


  return infographics;


}