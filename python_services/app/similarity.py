import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Function to calculate cosine similarity between two vectors
def calculate_cosine_similarity(query_embedding, doc_embedding):
    query_vector = np.array(query_embedding)
    doc_vector = np.array(doc_embedding)
    query_vector = query_vector.reshape(1, -1)
    doc_vector = doc_vector.reshape(1, -1)
    return cosine_similarity(query_vector, doc_vector)[0][0]

# Function to find the best matches
def find_best_matches(query_embedding, search_results, top_k=5):
    matches = []
    for result in search_results:
        stored_embedding = result['_source']['vector']
        similarity = calculate_cosine_similarity(query_embedding, stored_embedding)
        matches.append({
            "id": result['_id'],
            "source": result['_source'],
            "similarity": similarity
        })
    # Sort matches by similarity in descending order
    matches = sorted(matches, key=lambda x: x['similarity'], reverse=True)
    return matches[:top_k]  # Return top-k matches
