from elasticsearch import Elasticsearch
import logging
from app.config import ELASTICSEARCH_HOST, ELASTICSEARCH_USER, ELASTICSEARCH_PASS, ELASTICSEARCH_INDEX

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Connect to Elasticsearch
es = Elasticsearch(
    hosts=[ELASTICSEARCH_HOST],
    basic_auth=(ELASTICSEARCH_USER, ELASTICSEARCH_PASS),
    verify_certs=False
)

# Check Elasticsearch connection
def check_es_connection():
    try:
        if es.ping():
            logger.info("Successfully connected to Elasticsearch!")
        else:
            logger.error("Failed to connect to Elasticsearch.")
    except Exception as e:
        logger.error(f"Error connecting to Elasticsearch: {e}")

# Create Elasticsearch index if it doesn't exist
def create_index():
    if not es.indices.exists(index=ELASTICSEARCH_INDEX):
        index_body = {
            "mappings": {
                "properties": {
                    "embedding": {"type": "dense_vector", "dims": 1536},
                    "category": {"type": "keyword"},
                    "price": {"type": "float"},
                    "description": {"type": "text"}
                }
            }
        }
        es.indices.create(index=ELASTICSEARCH_INDEX, body=index_body)
        logger.info(f"Index '{ELASTICSEARCH_INDEX}' created successfully.")
    else:
        logger.info(f"Index '{ELASTICSEARCH_INDEX}' already exists.")

check_es_connection()
create_index()
