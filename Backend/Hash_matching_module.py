from PIL import Image
import imagehash

def compare_hashes(hash1, hash2, threshold=5):
    """
    Compare two perceptual hashes.
    
    :param hash1: First hash value
    :param hash2: Second hash value
    :param threshold: Tolerance for similarity
    :return: Boolean indicating match status
    """
    distance = imagehash.hex_to_hash(hash1) - imagehash.hex_to_hash(hash2)
    return distance <= threshold
