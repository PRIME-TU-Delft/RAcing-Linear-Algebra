from pymongo import MongoClient

# This python script was used to ease the task of fetching the IDs of the varians in the MongoDB database.
# Since each question would have 20 variants, it would very unnefficent to manually fetch the IDs of each variant.
# To use this script, change the mongo connection port, database name and collection name to your appropriate values and run.

def get_document_ids(collection_name):
    # Replace <hostname> and <port> with your MongoDB server's hostname and port number
    client = MongoClient("mongodb://127.0.0.1:27017")

    # Replace <database_name> with the name of your MongoDB database
    db = client["guitest"]

    # Access the specified collection
    collection = db[collection_name]

    # Retrieve the IDs of all documents in the collection
    document_ids = [str(document["_id"]) for document in collection.find({}, {"_id": 1})]

    # Close the MongoDB connection
    client.close()

    return document_ids

# Replace <collection_name> with the name of your MongoDB collection
collection_name = "as"

# Call the function to get the document IDs
ids = get_document_ids(collection_name)

# Print the document IDs
for doc_id in ids:
    print(f'"{doc_id}",')
