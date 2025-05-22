// src/Root.tsx
import { Composition , staticFile } from 'remotion';
import { CaptionedVideo } from './CaptionedVideo';
import { calculateMetadata } from './CaptionedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainClip"
      component={CaptionedVideo}
      calculateMetadata={calculateMetadata}
      defaultProps={{
        src: staticFile("upper.mp4"),
      }}
    />
  );
};
