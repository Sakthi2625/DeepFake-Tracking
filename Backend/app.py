from flask import Flask, request, jsonify
from fingerprint_module import extract_frames, generate_video_hash
from Hash_matching_module import compare_hashes
from webscrapper_module import search_videos
from Visualization_module import visualize_frames

import os




app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

UPLOAD_FOLDER = os.path.abspath('uploads')

@app.route('/')
def home():
    return "Backend is working!"

@app.route('/search')
def search():
    query = "deepfake"
    results = search_videos(query)
    return {"results": results}

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"+str(request.files)}), 400

    video = request.files['video']
    if video.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save video to the existing uploads folder
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], video.filename)
    video.save(video_path)

    return jsonify({"message": "Video uploaded successfully!", "path": video_path})


if __name__ == "__main__":
    print("Server is starting...")
    app.run(host="0.0.0.0", port=5001, debug=True)
