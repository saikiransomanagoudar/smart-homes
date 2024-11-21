import pandas as pd
from openai.embeddings_utils import get_embedding
from app.config import EMBEDDING_MODEL
from app.elastic_search_config import es, logger

# Load product records from CSV file
def load_product_records_from_csv(filename="resources/Products.csv"):
    try:
        # Read CSV file into a DataFrame
        products_df = pd.read_csv(filename)

        # Filter only the necessary columns: name, price, description, and category
        products_df = products_df[["name", "price", "description", "category"]]

        # Rename columns to match the expected format in the embedding generation function
        products_df.rename(
            columns={
                "name": "Product Name",
                "price": "Product Price",
                "description": "Description",
                "category": "Category",
            },
            inplace=True,
        )

        # Convert DataFrame to a list of dictionaries
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

    for product in products:
        product_name = product["Product Name"]
        product_price = float(product["Product Price"])
        category = product["Category"]
        description = product["Description"]

        product_text = f"Name: {product_name}, Category: {category}, Price: ${product_price}, Description: {description}"
        embedding = get_embedding(product_text, model=EMBEDDING_MODEL)

        product_embeddings[product_name] = {
            "embedding": embedding,
            "category": category,
            "price": product_price,
            "description": description,
        }

    logger.info(f"Completed the embedding generation process for {total_products} products.")
    return product_embeddings

# Save embeddings to Elasticsearch
def save_embeddings_to_elasticsearch(embeddings):
    total_saved = 0
    for product_name, data in embeddings.items():
        try:
            es.index(index="product_embeddings", id=product_name, document=data)
            logger.info(f"Saved embedding for product: {product_name} to Elasticsearch.")
            total_saved += 1
        except Exception as e:
            logger.error(f"Failed to save embedding for product: {product_name}. Error: {e}")
    logger.info(f"Completed saving {total_saved} embeddings to Elasticsearch.")
