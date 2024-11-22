import sys
import os

import openai
import pandas as pd
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
import os
import random
import mysql.connector
from mysql.connector import Error

sys.path.append(os.path.abspath("../../"))
sys.path.append(os.path.abspath("../../../"))  # Adjust the path to include the directory containing the 'app' module

from app.config import ELASTICSEARCH_HOST, ELASTICSEARCH_USER, ELASTICSEARCH_PASS

# Load API keys and environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

es = Elasticsearch(
    ELASTICSEARCH_HOST,
    basic_auth=(ELASTICSEARCH_USER, ELASTICSEARCH_PASS),
    verify_certs=False
)

# MySQL connection details
MYSQL_HOST = "localhost"
MYSQL_DATABASE = "smarthomes"
MYSQL_USER = "root"
MYSQL_PASSWORD = "root"

# Load Products.csv
csv_path = "../resources/Products.csv"
product_inventory = pd.read_csv(csv_path)

# Keep only required columns
product_inventory = product_inventory[["name", "price", "description", "category"]]

# Generate new products using OpenAI GPT
def generate_product_record(category):
    prompt = f"""
    Generate a product record for a SmartHome product in the category '{category}' with description of no more than 100 words. 
    The product record should include:
    - Product Name
    - Product Price
    - Category
    - Description (100 words max)
    Provide it in the following format:
     Product Name: ...
     Product Price: ...
     Category: ...
     Description: ...
    """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a product description generator."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=200,
        temperature=0.7,
    )
    return response["choices"][0]["message"]["content"].strip()

# Generate 10 new products
categories = ["Smart Doorbells", "Smart Locks", "Smart Speakers", "Smart Lighting", "Smart Thermostats"]
new_products = []

for _ in range(10):
    category = random.choice(categories)
    product_record = generate_product_record(category)

    product_lines = product_record.split("\n")

    product_dict = {
        "name": product_lines[0].split(": ")[1],
        "price": float(product_lines[1].split(": ")[1].replace("$", "")),
        "category": product_lines[2].split(": ")[1],
        "description": product_lines[3].split(": ")[1],
    }
    new_products.append(product_dict)

# Convert new products to DataFrame
new_products_df = pd.DataFrame(new_products)

# Combine existing and new products
combined_products = pd.concat([product_inventory, new_products_df], ignore_index=True)

# Generate embeddings using text-embedding-3-small model
def generate_embedding(text):
    response = openai.Embedding.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response["data"][0]["embedding"]

# Add embeddings to the combined dataset
combined_products["embedding"] = combined_products["description"].apply(generate_embedding)

# Save combined products locally for reference
combined_products.to_csv("../resources/GeneratedProducts.csv", index=False)

# Store combined products in Elasticsearch
index_name = "product_records"
if not es.indices.exists(index=index_name):
    es.indices.create(index=index_name)

for _, row in combined_products.iterrows():
    doc = {
        "name": row["name"],
        "price": row["price"],
        "category": row["category"],
        "description": row["description"],
        "embedding": row["embedding"],
    }
    es.index(index=index_name, body=doc)

print("Products and embeddings saved in Elasticsearch.")

# Store combined products in MySQL
def save_to_mysql(products):
    try:
        # Connect to MySQL
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            database=MYSQL_DATABASE,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
        )
        if connection.is_connected():
            print("Connected to MySQL database.")

        cursor = connection.cursor()

        # Insert products into the MySQL database
        insert_query = """
        INSERT INTO Products (name, price, description, image, category, retailer, quantity, onSale, hasRebate)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        for _, row in products.iterrows():
            cursor.execute(
                insert_query,
                (
                    row["name"],
                    row["price"],
                    row["description"],
                    "/images/default.jpg",  # Default image
                    row["category"],
                    "SmartHome Retailer",  # Default retailer
                    10,  # Default quantity
                    0,  # Default onSale
                    0,  # Default hasRebate
                ),
            )

        connection.commit()
        print(f"{cursor.rowcount} records inserted into the Products table.")
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed.")

# Save combined products to MySQL
save_to_mysql(combined_products)
