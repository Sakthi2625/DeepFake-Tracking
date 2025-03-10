from flask import Flask, request, jsonify, render_template
import os
from flask_cors import CORS  # ✅ Import CORS


app = Flask(__name__)
CORS(app)

# Set Upload Folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure templates folder exists (if not already present)
TEMPLATE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
if not os.path.exists(TEMPLATE_FOLDER):
    os.makedirs(TEMPLATE_FOLDER)

# Home Route - Serve `index.html`
@app.route('/')
def home():
    return render_template('index.html')  # ✅ Serves the frontend

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
    return jsonify({'message': 'File uploaded successfully', 'file_path': file_path})

if __name__ == '__main__':
    app.run(debug=True)

