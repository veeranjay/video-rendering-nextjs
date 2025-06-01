// src/MainClip.tsx
import { useCallback, useEffect, useMemo, useState } from "react";

import { OffthreadVideo , AbsoluteFill,useVideoConfig,useCurrentFrame, delayRender, continueRender, cancelRender, watchStaticFile, Loop} from 'remotion';

import { CalculateMetadataFunction, Sequence, staticFile, Video } from 'remotion';
import { parseMedia } from '@remotion/media-parser';
import { Caption } from "@remotion/captions";

import Captions from './Captions';
import { useInfographics } from "../../hooks/infographics";
import Infographics from "./Infographics";
import { loadFont } from "../../hooks/load_font";

import {Player} from '@remotion/player';
import { TrackedVideo } from "../../components/TrackedVideo";


type CaptionedVideoSchema = {
  src: string;
};

export const calculateMetadata: CalculateMetadataFunction<CaptionedVideoSchema> = async ({ props }) => {
  const { slowDurationInSeconds, dimensions } = await parseMedia({
    src: props.src,
    fields: {
      slowDurationInSeconds: true,
      dimensions: true,
    },
  });

  if (!dimensions) {
    throw new Error('Invalid video file: Dimensions could not be determined.');
  }

  const fps = 30;

  return {
    durationInFrames: Math.floor(slowDurationInSeconds * fps),
    fps,
    width:1080,
    height:1920,
  };
};



export const CaptionedVideo: React.FC<CaptionedVideoSchema> = ({ src }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());


  const {durationInFrames} = useVideoConfig();
 


  const captionsFile = src
    .replace(/.mp4$/, ".json")
    .replace(/.mkv$/, ".json")
    .replace(/.mov$/, ".json")
    .replace(/.webm$/, ".json");

  const infographics = useInfographics('infographics.json');


  // fetch captions callback
  const fetchCaptions = useCallback(async ()=>{
    try{
      await loadFont();
      const res = await fetch(captionsFile);
      const data = (await res.json()) as Caption[];
      setCaptions(data);
      continueRender(handle);
    }catch (e){
      cancelRender(e);
    }
  }, [handle, captionsFile]);



  useEffect( ()=>{
    fetchCaptions();

    const c = watchStaticFile(captionsFile, ()=>{
      fetchCaptions();
    });


    return ()=>{
      c.cancel();
    }
  }, [fetchCaptions,src,captionsFile]);

  


  return (
    <AbsoluteFill style={{flex:1,background:'white'}}>
        <AbsoluteFill>
        <OffthreadVideo
                style={{
            position:'absolute',
              objectFit: "cover",
              width: '100%',
              height: '50%',
              top: 0,
          }}
                src={src}
                volume={1.5}
                
                />
               
        </AbsoluteFill>
        {/* <AbsoluteFill>

         <TrackedVideo src={src} />
        </AbsoluteFill> */}

<AbsoluteFill>
  <Loop durationInFrames={durationInFrames}>
  <OffthreadVideo
          style={{
            position:'absolute',
              objectFit: "cover",
              width: '100%',
              height: '50%',
              bottom: 0,
          }}

          src={staticFile('lower.mp4')}
          muted={true}

          />
    </Loop>
        </AbsoluteFill>
        

        <Captions captions={captions} />
        {
          infographics != null && <Infographics infographics={infographics}/>

        }
        

   
    </AbsoluteFill>



       
  );
};
