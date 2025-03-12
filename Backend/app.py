from flask import Flask, request, jsonify, render_template
import os
import cv2
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

# Set Upload Folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Define the frames directory
FRAMES_FOLDER = 'frames'
os.makedirs(FRAMES_FOLDER, exist_ok=True)

# Load the Hugging Face Deepfake Detection Model
MODEL_NAME = "prithivMLmods/Deepfake-Detection-Exp-02-22"
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)

def extract_frames(video_path, filename, interval=10):
    """Extracts frames from the uploaded video at a given interval (every 'interval' frames)."""
    video_name = os.path.splitext(filename)[0]
    output_folder = os.path.join(FRAMES_FOLDER, video_name)
    os.makedirs(output_folder, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    success, frame = cap.read()
    extracted_frames = []  # Store paths of extracted frames

    while success:
        if frame_count % interval == 0:
            frame_filename = os.path.join(output_folder, f'frame_{frame_count}.jpg')
            cv2.imwrite(frame_filename, frame)
            extracted_frames.append(frame_filename)
        success, frame = cap.read()
        frame_count += 1

    cap.release()
    return extracted_frames  # Return list of extracted frame paths

def detect_deepfake(frames):
    """Detects deepfakes in extracted frames."""
    results = {}

    for frame_path in frames:
        image = Image.open(frame_path).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")  # Process image

        with torch.no_grad():
            outputs = model(**inputs)

        predicted_class = torch.argmax(outputs.logits, dim=-1).item()
        label = "Deepfake" if predicted_class == 0 else "Real"

        results[os.path.basename(frame_path)] = label  # Use filename instead of full path

    return results

# Ensure templates folder exists (if not already present)
TEMPLATE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
if not os.path.exists(TEMPLATE_FOLDER):
    os.makedirs(TEMPLATE_FOLDER)

# Home Route - Serve `index.html`
@app.route('/')
def home():
    return render_template('index.html')

# Upload Route
@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Extract frames
    extracted_frames = extract_frames(file_path, file.filename)

    # Perform deepfake detection
    detection_results = detect_deepfake(extracted_frames)

    return jsonify({
        'message': 'File uploaded, frames extracted, and deepfake detection completed',
        'file_path': file_path,
        'detection_results': detection_results
    })

if __name__ == '__main__':
    app.run(debug=True)
