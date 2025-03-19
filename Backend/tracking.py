import os
import cv2
import imagehash
from PIL import Image

FRAMES_FOLDER = 'frames'
os.makedirs(FRAMES_FOLDER, exist_ok=True)

def extract_frames_and_hash(video_path, filename, interval=10):
    """Extract frames and compute pHash for tracking."""
    video_name = os.path.splitext(filename)[0]
    output_folder = os.path.join(FRAMES_FOLDER, video_name)
    os.makedirs(output_folder, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    success, frame = cap.read()
    frame_hashes = {}

    while success:
        if frame_count % interval == 0:
            frame_filename = os.path.join(output_folder, f'frame_{frame_count}.jpg')
            cv2.imwrite(frame_filename, frame)

            # Convert frame to pHash
            image = Image.open(frame_filename).convert("L")  # Convert to grayscale
            phash = str(imagehash.phash(image))  # Compute perceptual hash
            frame_hashes[frame_filename] = phash

        success, frame = cap.read()
        frame_count += 1

    cap.release()
    return frame_hashes  # Return extracted frame hashes
