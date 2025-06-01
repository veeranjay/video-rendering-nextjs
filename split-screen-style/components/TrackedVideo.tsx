import { OffthreadVideo, useCurrentFrame } from 'remotion';
import trackingData from '../public/face_tracking.json';
import { useSmoothedMotion } from '../hooks/useSmoothedMotion';

const VIDEO_ORIGINAL_WIDTH = 1920;
const VIDEO_ORIGINAL_HEIGHT = 1080;
const CANVAS_WIDTH = 1080;
const TOP_HALF_HEIGHT = 960;

export const TrackedVideo: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();

  // Find face data for current frame
  const frameData = trackingData.find((d) => d.frame === frame);
  if (!frameData || !frameData.faces || frameData.faces.length === 0) {
    return null; // No face data this frame
  }

  // Take first detected face (can be extended to handle multiple)
  const face = frameData.faces[0];
  if (!face.bbox) return null;

  // Calculate bbox center in pixels
  const bbox = face.bbox;
  const bboxCenterX = ((bbox.xmin + bbox.xmax) / 2) * VIDEO_ORIGINAL_WIDTH;
  const bboxCenterY = ((bbox.ymin + bbox.ymax) / 2) * VIDEO_ORIGINAL_HEIGHT;

  // Target center in canvas coordinates (top half)
  const targetCenterX = CANVAS_WIDTH / 2;
  const targetCenterY = TOP_HALF_HEIGHT / 2;

  // Calculate raw offsets needed to translate video so bbox center aligns with target center
  const rawOffsetX = targetCenterX - bboxCenterX;
  const rawOffsetY = targetCenterY - bboxCenterY;

  // Smooth the offsets for stable motion
  const offsetX = useSmoothedMotion(rawOffsetX, 0.3);
  const offsetY = useSmoothedMotion(rawOffsetY, 0.3);

  // Optional: fixed scale or dynamic scaling
  const scale = 1.0;

  return (
    <div
      style={{
        position: 'relative',
        width: CANVAS_WIDTH,
        height: TOP_HALF_HEIGHT,
        overflow: 'hidden',
        backgroundColor: 'black',
      }}
    >
      <OffthreadVideo
        src={src}
        style={{
          width: VIDEO_ORIGINAL_WIDTH,
          height: VIDEO_ORIGINAL_HEIGHT,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        }}
      />

      {/* Visualize bbox center for debugging */}
      <div
        style={{
          position: 'absolute',
          left: targetCenterX - 10, // center circle 20x20
          top: targetCenterY - 10,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'lime',
          border: '2px solid white',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
};
