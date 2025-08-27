import os
from flask import Blueprint, jsonify, request
import logging
import openai
from flask_cors import CORS, cross_origin
from app.elastic_search_config import es, ELASTICSEARCH_INDEX

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

# Initialize Flask Blueprint and CORS
main = Blueprint("main", __name__)
CORS(main)

# OpenAI API Key (set this securely, e.g., as an environment variable)
openai.api_key = os.getenv("OPENAI_API_KEY")


# Function to generate embedding using OpenAI API
def get_embedding_from_openai(query):
    try:
        response = openai.Embedding.create(
            input=query, model="text-embedding-3-small"  # Use the model specified
        )
        return response["data"][0]["embedding"]
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise


@main.route("/recommend-product", methods=["GET", "POST"])
@cross_origin(supports_credentials=True)
def recommend_product():
    try:
        # Extract query text from request
        if request.method == "GET":
            query_text = request.args.get("query", "")
        elif request.method == "POST":
            data = request.get_json()
            query_text = data.get("queryText", "")
        else:
            logger.error("Invalid request method.")
            return jsonify({"error": "Invalid request method"}), 405

        if not query_text:
            logger.error("Query parameter is missing.")
            return jsonify({"error": "Query parameter is required"}), 400

        # Generate embedding for the query text
        embedding = get_embedding_from_openai(query_text)

        # Elasticsearch query for semantic similarity
        search_body = {
            "query": {
                "script_score": {
                    "query": {"match_all": {}},
                    "script": {
                        "source": """
                    if (params.query_vector == null || doc['embedding'].size() != params.query_vector.length) {
                        return 0.0;  // Safe fallback for mismatched dimensions
                    }
                    return cosineSimilarity(params.query_vector, doc['embedding']) + 1.0;
                """,
                        "params": {
                            "query_vector": embedding  # Embedding generated from queryText
                        },
                    },
                }
            },
            "size": 4,  # Adjust as needed
        }

        # Perform the search
        response = es.search(index=ELASTICSEARCH_INDEX, body=search_body)

        # Extract product details and scores
        hits = response.get("hits", {}).get("hits", [])
        products = [{"product": hit["_source"], "score": hit["_score"]} for hit in hits]

        logger.info(f"Found {len(products)} products for the query.")
        return jsonify({"products": products}), 200

    except Exception as e:
        logger.error(f"Error in recommend_product: {e}")
        return jsonify({"error": str(e)}), 500
