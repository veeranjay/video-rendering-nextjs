import { Caption } from "@remotion/captions";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { Page } from "./Page";


import { useCustomStyleCaptions } from "../../hooks/useCustomStyleCaptions";

const SWITCH_CAPTIONS_EVERY_MS = 2000;

const Captions: React.FC<{captions:Caption[]}> = ({captions})=>{
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const {pages} = useCustomStyleCaptions({captions, maxCharactersPerSegment:11}) ?? [];

    return(

        <AbsoluteFill> 
            {
                pages.map((page, index) => {

                  let numTokens = pages.slice(0, index).map(page=>page.tokens.length);
                  let totalTokens = 0;
                  for(let i = 0; i < numTokens.length; ++i){
                    totalTokens += numTokens[i];
                  }
                    const nextPage = pages[index + 1] ?? null;
                    const captionStartFrame = (page.startMs/1000) * fps;
                    const captionEndFrame = Math.min(
                        nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
                        captionStartFrame + SWITCH_CAPTIONS_EVERY_MS,
                      );
                    const duration = captionEndFrame - captionStartFrame;
                    if (duration <= 0) {
                        return null;
                      }
                    return (
                      <Sequence from={captionStartFrame} durationInFrames={duration}>
                        <Page page={page} totalSoFar={totalTokens}/>
                      </Sequence>
                    );
                })
            }
        </AbsoluteFill>
    );

}

export default Captions;