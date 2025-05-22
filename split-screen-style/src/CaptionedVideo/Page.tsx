import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
  interpolateColors
} from "remotion";


import { PageSchema } from "../../hooks/useCustomStyleCaptions";
const HIGHLIGHT_COLORS = ["#F8333C", "#792CFD" ,"#25FFB6", "#FFBF2A"];

const fonts = ["Bebas"] as const;

type Font = typeof fonts[number];

const weights: Record<Font, string> = {
  Bebas: "400",
};


type ExtrudedTextProps = {
  text: string;
  fontSize?: number;
  color?: string;
  shadowColor?: string;
  shadowDepth?: number;
  outline?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
  padding?: number;
  fontFamily?: string;
  fontWeight?: string;
  transform?: string;
  transition?:string;
  background?:string;
  marginHorizontal?: number;
};

export const ExtrudedText: React.FC<ExtrudedTextProps> = ({
  text,
  fontSize = 120,
  color = "white",
  fontFamily = "Arial Black",
  fontWeight = "bold",
  shadowColor = "black",
  shadowDepth = 6,
  outline = false,
  outlineColor = "black",
  outlineWidth = 2,
  padding = 15,
  transform,
  transition,
  background = 'transparent',
  marginHorizontal = 0
}) => {
  const extrusionShadows = Array.from({ length: shadowDepth }, (_, i) => {
    const offset = i + 1;
    return `${offset}px ${offset}px 0 ${shadowColor}`;
  }).join(", ");

  const sharedStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    fontFamily,
    padding,

    transform,
    transition,
    background,
    marginLeft:marginHorizontal,
    marginRight:marginHorizontal
    
  };

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      {/* Main text with shadow */}
      <div
        style={{
          ...sharedStyle,
          color,
          textShadow: extrusionShadows,
          borderRadius:30,
        }}
      >
        {text}
      </div>
        
      {/* Overlay with outline */}
      {outline && (
        <span
          style={{
            ...sharedStyle,
            position: "absolute",
            top: 0,
            left: 0,
            color: "transparent",
            WebkitTextStroke: `${outlineWidth}px ${outlineColor}`,
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};


export const Page: React.FC<{readonly page: PageSchema; totalSoFar: number}> = ({page, totalSoFar }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = (frame / fps) * 1000;


  return (
    <AbsoluteFill >
      <div
        style={{
            position: 'absolute',
            width: '80%',
    bottom: 900,
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign:'center',
    zIndex:10,
        }}
      >
          {page.tokens.map((t, index) => {
            const startRelativeToSequence = t.fromMs - page.startMs;
            const endRelativeToSequence = t.toMs - page.startMs;


            const duration = endRelativeToSequence - startRelativeToSequence;


            const startFrame = Math.floor(startRelativeToSequence * fps / 1000);
            const endFrame = Math.floor(endRelativeToSequence * fps / 1000);

            const nextStartFrame = index<page.tokens.length-1? Math.floor((page.tokens[index+1].fromMs-page.startMs) * fps / 1000):1000000000;
            // const nextEndFrame = index<page.tokens.length-1? Math.floor((page.tokens[index+1].toMs-page.startMs) * fps / 1000):endFrame;

            const currentFrame = frame;

            const isActive = currentFrame >= startFrame && currentFrame < nextStartFrame;




            const color = HIGHLIGHT_COLORS[(totalSoFar + 1 + index) % HIGHLIGHT_COLORS.length];


            // const fontIndex = (totalSoFar + 1 + index) % fonts.length;
            // const font = fonts[fontIndex];
            // const fontWeight = weights[font];



          const scale = spring({
            frame: currentFrame - startFrame,
            fps,
            config: {
              damping: 100,
              mass: 0.8,
            },
            durationInFrames: 10,
          });


          // Use spring-in and spring-out
          const endScale = spring({
            frame: currentFrame - nextStartFrame, // Start shrinking before next word activates
            fps,
            config: {
              damping: 100,
              mass: 0.8,
            },
            durationInFrames: 10,
          });

          const effectiveScale = isActive
            ? interpolate(scale, [0, 1], [1, 1.15])
            : currentFrame>=startFrame?interpolate(endScale, [0, 1], [1.15, 1]):1;



            
            return (
              <ExtrudedText
                key={t.fromMs}
                
                text={t.text.toUpperCase()}
                shadowColor={"black"}
                shadowDepth={13}
                fontSize={95}
                fontFamily={'Bebas'}
                fontWeight="700"

                color={isActive? color: 'white'}
                transform={`scale(${effectiveScale})`}
                padding={15}
                marginHorizontal={5}
                
              />
            );
          })}

      </div>
    </AbsoluteFill>
  );
};