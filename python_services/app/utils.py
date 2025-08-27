import pandas as pd
import openai
from app.config import EMBEDDING_MODEL
from app.elastic_search_config import es, logger

# Generate embedding for a given text
def get_embedding(text, model="text-embedding-3-small"):
    try:
        response = openai.Embedding.create(
            model=model,
            input=text,
        )
        embedding = response["data"][0]["embedding"]
        logger.debug(f"Generated embedding for text: {text[:50]}...")  # Log the input text (first 50 chars for brevity)
        logger.debug(f"Embedding: {embedding}")  # Log the first 5 values of the embedding
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding for text: {text[:50]}... Error: {e}")
        raise

# Load product records from CSV file
def load_product_records_from_csv(filename="resources/Products.csv"):
    try:
        products_df = pd.read_csv(filename)
        products_df = products_df[["name", "price", "description", "category"]]
        products_df.rename(
            columns={
                "name": "Product Name",
                "price": "Product Price",
                "description": "Description",
                "category": "Category",
            },
            inplace=True,
        )
        products = products_df.to_dict(orient="records")
        logger.info(f"Successfully loaded {len(products)} products from {filename}.")
        return products
    except Exception as e:
        logger.error(f"Failed to load product records from {filename}. Error: {e}")
        return []

# Generate embeddings for products
def generate_embeddings(products):
    total_products = len(products)
    logger.info(f"Starting the embedding generation process for {total_products} products.")
    product_embeddings = {}

    for index, product in enumerate(products, start=1):
        product_name = product["Product Name"]
        product_price = float(product["Product Price"])
        category = product["Category"]
        description = product["Description"]

        product_text = f"Name: {product_name}, Category: {category}, Price: ${product_price}, Description: {description}"
        try:
            embedding = get_embedding(product_text, model=EMBEDDING_MODEL)
            product_embeddings[product_name] = {
                "embedding": embedding,
                "category": category,
                "price": product_price,
                "description": description,
            }
            logger.debug(f"[{index}/{total_products}] Generated embedding for product: {product_name}")
        except Exception as e:
            logger.error(f"Failed to generate embedding for product: {product_name}. Error: {e}")

    logger.info(f"Completed the embedding generation process for {total_products} products.")
    return product_embeddings

# Save embeddings to Elasticsearch
def save_embeddings_to_elasticsearch(embeddings):
    total_saved = 0
    logger.info(f"Starting the process of saving {len(embeddings)} embeddings to Elasticsearch.")
    for product_name, data in embeddings.items():
        try:
            es.index(index="product_embeddings", id=product_name, document=data)
            logger.info(f"Saved embedding for product: {product_name} to Elasticsearch.")
            logger.debug(f"Elasticsearch Document: {data}")
            total_saved += 1
        except Exception as e:
            logger.error(f"Failed to save embedding for product: {product_name}. Error: {e}")
    logger.info(f"Completed saving {total_saved} embeddings to Elasticsearch.")
