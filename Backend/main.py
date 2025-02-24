from flask import Flask, request, jsonify
import os
from fingerprint_module import extract_frames, generate_video_hash
from webscrapper_module import scrape_images_and_hashes
from Hash_matching_module import load_fingerprints, compare_hashes_with_distance
from Visualization_module import visualize_propagation

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    
    # Process the file
    output_folder = 'frames'
    extract_frames(filepath, output_folder)

    # Scrape web and compare fingerprints
    web_hashes = scrape_images_and_hashes("https://example.com")  # Use any site for testing
    video_hashes = load_fingerprints(output_folder)
    matches = compare_hashes_with_distance(video_hashes, web_hashes)

    # Visualize if matches are found
    if matches:
        visualize_propagation(matches)
        return jsonify({"status": "Matches found and visualization created!"})
    else:
        return jsonify({"status": "No matches found"})

if __name__ == '__main__':
    app.run(port=5000)
