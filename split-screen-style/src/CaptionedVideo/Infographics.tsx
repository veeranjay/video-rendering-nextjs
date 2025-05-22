import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence, staticFile } from "remotion";
import { InfographicItem } from "../../hooks/infographics"
import { AnimatedInfographicMedia, AnimationType } from "../../components/AnimatedInfographics";


const animations : AnimationType[] = ['zoomIn', 'zoomOut', 'panDown', 'panLeft', 'panRight'];

const Infographics : React.FC<{infographics:InfographicItem[]}> = ({infographics}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();


    return (
        <AbsoluteFill>

            {
                infographics?.map((item, index)=>{
                    
                    const animationIndex = Math.floor(Math.random()*4);
                    const startFrame = Math.floor((item.startMs / 1000 ) * fps);
                    const endFrame = Math.floor(((item.startMs + item.durationMs)/1000)*fps);


                    const duration = endFrame - startFrame;
                    return (
                        <Sequence from={startFrame} durationInFrames={duration}>
                            {/* <span style={{color:'white', fontSize:200}}>
                                {item.uri}
                                
                            </span> */}

                            <div
                                style={{
                                position: 'absolute',
                                top: 0,
                                width: '100%',
                                height: '50%',
                                overflow: 'hidden',
                                zIndex: 8,
                                }}
                            >
                            
                            {item.type === 'image' && 
                            <AnimatedInfographicMedia animationSpeed={3} animationType={item.animation} durationInFrames={duration} mediaType="image" mediaScale={2}  src={item.uri}/>
                            }


                            </div>

                        </Sequence>
                    );
                })
            }

        </AbsoluteFill>

    );
}

export default Infographics;