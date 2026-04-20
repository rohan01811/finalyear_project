
import cv2
import mediapipe as mp
import numpy as np


# 🔥 Faster config
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=2,
    refine_landmarks=False   # ✅ performance boost
)

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]


def analyze_frame(image_bytes):

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    frame = cv2.resize(frame, (320, 240))

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = mp_face_mesh.process(rgb)

    response = {
        "face_detected": False,
        "multiple_faces": False,
        "eye_contact": True,
        "warning": ""
    }

    if not results.multi_face_landmarks:
        response["face_detected"] = False
        response["warning"] = "No face detected"
        return response

    faces = results.multi_face_landmarks
    response["face_detected"] = True

    if len(faces) > 1:
        response["multiple_faces"] = True
        response["warning"] = "Multiple people detected"
        return response

    face = faces[0]

  # ===============================
# 🔥 STRICT HEAD DETECTION (COMBINED)
# ===============================
    left_eye = face.landmark[33]
    right_eye = face.landmark[263]
    nose = face.landmark[1]

    dist_left = abs(nose.x - left_eye.x)
    dist_right = abs(nose.x - right_eye.x)

    ratio = dist_left / (dist_right + 1e-6)

    # 🔥 RIGHT SIDE DETECTION
    if ratio > 1.3 or nose.x > 0.58:
        response["eye_contact"] = False
        response["warning"] = "Looking right (head)"
        return response

    # 🔥 LEFT SIDE DETECTION
    elif ratio < 0.75 or nose.x < 0.42:
        response["eye_contact"] = False
        response["warning"] = "Looking left (head)"
        return response

    # ===============================
    # 👁️ EYE TRACKING (OLD LOGIC)
    # ===============================
    left_eye_points = [face.landmark[i] for i in LEFT_EYE]
    right_eye_points = [face.landmark[i] for i in RIGHT_EYE]

    def get_eye_center(points):
        x = np.mean([p.x for p in points])
        y = np.mean([p.y for p in points])
        return x, y

    left_center = get_eye_center(left_eye_points)
    right_center = get_eye_center(right_eye_points)

    avg_x = (left_center[0] + right_center[0]) / 2

    if avg_x < 0.35:
        response["eye_contact"] = False
        response["warning"] = "Looking left (eyes)"

    elif avg_x > 0.65:
        response["eye_contact"] = False
        response["warning"] = "Looking right (eyes)"

    return response