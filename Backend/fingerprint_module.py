import cv2
import imagehash
from PIL import Image
import os

def extract_frames(video_path, output_folder, frame_interval=30):
    """
    Extract frames from a video at regular intervals.
    
    :param video_path: Path to the video file
    :param output_folder: Folder to save the extracted frames
    :param frame_interval: Interval between frames (in seconds)
    """
    os.makedirs(output_folder, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    
    frame_count = 0
    success, frame = cap.read()
    fps = cap.get(cv2.CAP_PROP_FPS)
    interval_frames = int(fps * frame_interval)
    
    while success:
        if frame_count % interval_frames == 0:
            frame_filename = os.path.join(output_folder, f"frame_{frame_count}.jpg")
            cv2.imwrite(frame_filename, frame)
        
        success, frame = cap.read()
        frame_count += 1
    
    cap.release()
    print(f"Frames extracted and saved to {output_folder}")

def generate_video_hash(frame_path):
    """
    Generate a perceptual hash for a video frame.
    
    :param frame_path: Path to the frame image
    :return: Hash value (hexadecimal string)
    """
    img = Image.open(frame_path)
    hash_value = imagehash.phash(img)
    return str(hash_value)
