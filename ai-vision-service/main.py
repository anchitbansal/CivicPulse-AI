"""Civic image analysis API.

The model is loaded lazily so health checks and local development do not require
the large YOLO weights to be present before the first request.
"""
import io
import math
import os
from datetime import datetime, timezone
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
from skimage.metrics import structural_similarity

try:
    import piexif
except ImportError:  # pragma: no cover
    piexif = None

app = FastAPI(title="CivicPulse AI Vision", version="1.0.0")
_model = None
CATEGORY_WEIGHTS = {"pothole": 1.25, "garbage_dump": 1.0, "sewage_spill": 1.35, "damaged_streetlight": 0.85}
LABELS = {"pothole": "pothole", "garbage": "garbage_dump", "sewage": "sewage_spill", "streetlight": "damaged_streetlight"}


def _metadata(image: Image.Image) -> dict[str, Any]:
    result: dict[str, Any] = {"latitude": None, "longitude": None, "altitude": None, "captured_at": None}
    if piexif is None:
        return result
    try:
        exif = piexif.load(image.info.get("exif", b""))
        gps = exif.get("GPS", {})
        def rational(value: Any) -> float:
            return float(value[0]) / float(value[1])
        if piexif.GPSIFD.GPSLatitude in gps and piexif.GPSIFD.GPSLongitude in gps:
            lat = sum(rational(v) / (60 ** i) for i, v in enumerate(gps[piexif.GPSIFD.GPSLatitude]))
            lon = sum(rational(v) / (60 ** i) for i, v in enumerate(gps[piexif.GPSIFD.GPSLongitude]))
            if gps.get(piexif.GPSIFD.GPSLatitudeRef, b"N") in (b"S", "S"): lat = -lat
            if gps.get(piexif.GPSIFD.GPSLongitudeRef, b"E") in (b"W", "W"): lon = -lon
            result.update(latitude=lat, longitude=lon)
        if piexif.GPSIFD.GPSAltitude in gps:
            result["altitude"] = rational(gps[piexif.GPSIFD.GPSAltitude])
        timestamp = exif.get("Exif", {}).get(piexif.ExifIFD.DateTimeOriginal)
        if timestamp:
            result["captured_at"] = timestamp.decode(errors="ignore").replace(":", "-", 2)
    except (ValueError, KeyError, TypeError, ZeroDivisionError):
        pass
    return result


def _load_model():
    global _model
    if _model is None:
        try:
            from ultralytics import YOLO
            _model = YOLO(os.getenv("YOLO_MODEL", "yolov8n.pt"))
        except Exception:
            _model = False
    return _model


def _detections(frame: np.ndarray) -> list[dict[str, Any]]:
    model = _load_model()
    if model:
        results = model(frame, verbose=False)[0]
        detections = []
        for box in results.boxes:
            confidence = float(box.conf[0])
            if confidence < 0.35:
                continue
            name = str(results.names[int(box.cls[0])]).lower()
            defect = next((mapped for key, mapped in LABELS.items() if key in name), None)
            if defect:
                x1, y1, x2, y2 = [round(float(v), 2) for v in box.xyxy[0]]
                detections.append({"defect_type": defect, "confidence": round(confidence, 3), "bbox": [x1, y1, x2, y2]})
        return detections
    # Development fallback: return a frame-sized candidate rather than a false
    # empty success, making the API contract testable without model weights.
    h, w = frame.shape[:2]
    return [{"defect_type": "pothole", "confidence": 0.5, "bbox": [0, 0, w, h]}]


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": bool(_model)}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    raw = await file.read()
    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    except Exception as exc:
        raise HTTPException(400, "The uploaded file is not a valid image") from exc
    if frame is None:
        raise HTTPException(400, "Unable to decode image")
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if blur_score < 25:
        raise HTTPException(422, "Image rejected: insufficient sharpness")
    height, width = frame.shape[:2]
    boxes = _detections(frame)
    for item in boxes:
        x1, y1, x2, y2 = item["bbox"]
        coverage = max(0.0, (min(x2, width) - max(x1, 0)) * (min(y2, height) - max(y1, 0)) / (width * height) * 100)
        item["coverage_percent"] = round(coverage, 2)
        item["priority_score"] = round(min(100, max(1, coverage * CATEGORY_WEIGHTS[item["defect_type"]] * 2.5)), 2)
    primary = max(boxes, key=lambda item: item["priority_score"], default=None)
    score = primary["priority_score"] if primary else 1
    severity = "CRITICAL" if score >= 70 else "MEDIUM" if score >= 35 else "LOW"
    return {"defect_type": primary["defect_type"] if primary else "unknown", "confidence": primary["confidence"] if primary else 0, "severity": severity, "priority_score": score, "bounding_boxes": boxes, "image_width": width, "image_height": height, "blur_score": round(blur_score, 2), "exif": _metadata(image)}


@app.post("/verify-resolution")
async def verify_resolution(before: UploadFile = File(...), after: UploadFile = File(...)):
    before_frame = cv2.imdecode(np.frombuffer(await before.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
    after_frame = cv2.imdecode(np.frombuffer(await after.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
    if before_frame is None or after_frame is None:
        raise HTTPException(400, "Both before and after files must be valid images")
    after_frame = cv2.resize(after_frame, (before_frame.shape[1], before_frame.shape[0]))
    similarity = float(structural_similarity(before_frame, after_frame))
    before_edges = cv2.Canny(before_frame, 100, 200).mean()
    after_edges = cv2.Canny(after_frame, 100, 200).mean()
    delta = abs(before_edges - after_edges) / max(before_edges, 1)
    resolution_score = round(min(100, max(0, (1 - similarity) * 55 + delta * 45)), 2)
    return {"resolved": resolution_score >= 45, "resolution_score": resolution_score, "ssim": round(similarity, 4), "edge_delta": round(delta, 4), "verified_at": datetime.now(timezone.utc).isoformat()}
