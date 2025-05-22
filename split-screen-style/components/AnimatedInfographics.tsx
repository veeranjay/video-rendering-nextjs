import { useCurrentFrame, interpolate, OffthreadVideo } from 'remotion';

export type AnimationType = 'zoomIn' | 'zoomOut' | 'panUp' | 'panDown' | 'panLeft' | 'panRight' | 'static';

export type AnimatedInfographicMediaProps = {
  src: string;
  durationInFrames: number;
  animationType?: AnimationType;
  animationSpeed:number;
  mediaType?: 'image' | 'video';
  mediaScale: number;
};

export const AnimatedInfographicMedia: React.FC<AnimatedInfographicMediaProps> = ({
  src,
  durationInFrames,
  animationType,
  animationSpeed = 1,
  mediaType,
  mediaScale
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Compute transforms based on animation type
  let scale = 1;
  let x = 0;
  let y = 0;

  switch (animationType) {
    case 'zoomIn':
      scale = 1 + 0.15 * progress;
      break;
    case 'zoomOut':
      scale = 1.15 - 0.15 * progress;
      break;
    case 'panUp':
      y = 20 - 40 * animationSpeed * progress;
      break;
    case 'panDown':
      y = -20 + 40 * animationSpeed * progress;
      break;
    case 'panRight':
      x = -20 + 40 * animationSpeed * progress;
      break;

    case 'panLeft':
        x = 20 - 40 *animationSpeed * progress;
        break;
    case 'static':
    default:
      break;
  }

  const commonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `translate(${x}px, ${y}px) scale(${scale * mediaScale})`,
    transformOrigin: 'center',
  };

  return mediaType === 'video' ? (
    <OffthreadVideo src={src} style={commonStyle} muted />
  ) : (
    <img src={src} style={commonStyle} />
  );
};
