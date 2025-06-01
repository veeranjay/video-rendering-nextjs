import cv2
import mediapipe as mp
import json
import os

def extract_face_and_nose_data(video_path, output_path):
    mp_face_detection = mp.solutions.face_detection
    mp_face_mesh = mp.solutions.face_mesh

    cap = cv2.VideoCapture(video_path)
    frame_num = 0
    data = []

    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection, \
         mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5) as face_mesh:

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Face detection to get bbox
            detection_results = face_detection.process(frame_rgb)

            if detection_results.detections and len(detection_results.detections) > 0:
                detection = detection_results.detections[0]

                bboxC = detection.location_data.relative_bounding_box
                xmin = max(bboxC.xmin, 0)
                ymin = max(bboxC.ymin, 0)
                width = bboxC.width
                height = bboxC.height

                # Face mesh for landmarks
                mesh_results = face_mesh.process(frame_rgb)
                nose = None
                if mesh_results.multi_face_landmarks:
                    face_landmarks = mesh_results.multi_face_landmarks[0]
                    # Nose tip index in mediapipe face mesh is 1
                    nose_landmark = face_landmarks.landmark[1]
                    nose = {
                        "x": nose_landmark.x,  # normalized [0,1]
                        "y": nose_landmark.y   # normalized [0,1]
                    }

                frame_data = {
                    "frame": frame_num,
                    "faces": [
                        {
                            "bbox": {
                                "xmin": xmin,
                                "ymin": ymin,
                                "width": width,
                                "height": height
                            },
                            "nose": nose
                        }
                    ]
                }
            else:
                # No face detected this frame
                frame_data = {
                    "frame": frame_num,
                    "faces": []
                }

            data.append(frame_data)
            frame_num += 1

    cap.release()

    # Save JSON file
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Face tracking data saved to {output_path}")

if __name__ == "__main__":
    # Resolve paths relative to this script location
    cwd = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.abspath(os.path.join(cwd, "..", "public"))
    video_file = os.path.join(public_dir, "upper.mp4")
    output_file = os.path.join(public_dir, "face_tracking.json")

    extract_face_and_nose_data(video_file, output_file)
