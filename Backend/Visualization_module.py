import matplotlib.pyplot as plt
from PIL import Image

def visualize_frames(frame_folder):
    """
    Visualize extracted video frames.
    
    :param frame_folder: Folder containing extracted frames
    """
    images = [os.path.join(frame_folder, img) for img in os.listdir(frame_folder) if img.endswith('.jpg')]

    if not images:
        print("No frames found for visualization.")
        return

    fig, axes = plt.subplots(1, min(len(images), 5), figsize=(15, 5))
    for ax, img_path in zip(axes, images):
        img = Image.open(img_path)
        ax.imshow(img)
        ax.axis('off')
    
    plt.show()
