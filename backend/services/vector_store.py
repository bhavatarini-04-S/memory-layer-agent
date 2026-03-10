vector_db = []

def store_vector(vec, text):

    vector_db.append({
        "vector": vec,
        "text": text
    })

def search_vector(query_vec):

    return vector_db[:3]