from flask import Blueprint, jsonify
from app.utils import load_product_records_from_json, generate_embeddings, save_embeddings_to_elasticsearch
from app.elastic_search_config import es, ELASTICSEARCH_INDEX

main = Blueprint('main', __name__)

# Route to generate embeddings and save to Elasticsearch
@main.route('/generate-embeddings', methods=['GET'])
def generate_and_store_embeddings():
    try:
        products = load_product_records_from_json()
        product_embeddings = generate_embeddings(products)
        save_embeddings_to_elasticsearch(product_embeddings)
        return jsonify({"message": "Embeddings generated and saved to Elasticsearch successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to search embeddings in Elasticsearch
@main.route('/search-embeddings', methods=['GET'])
def search_embeddings():
    try:
        response = es.search(index=ELASTICSEARCH_INDEX, body={"query": {"match_all": {}}})
        return jsonify(response["hits"]["hits"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
