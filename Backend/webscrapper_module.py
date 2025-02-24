import requests

def search_videos(fingerprint_hash):
    """
    Simulate a search for videos matching the given fingerprint hash.
    
    :param fingerprint_hash: The hash value to search for
    :return: List of matching video URLs (dummy data for now)
    """
    # In a real project, you’d use an API or a search engine.
    # For now, we'll mock some results:
    results = [
        {"url": "https://example.com/video1", "match_percentage": 95},
        {"url": "https://example.com/video2", "match_percentage": 87},
        {"url": "https://example.com/video3", "match_percentage": 75},
    ]

    # Filter results (example logic)
    matches = [result for result in results if result['match_percentage'] >= 80]
    
    if matches:
        return matches
    else:
        return [{"message": "No significant matches found."}]
