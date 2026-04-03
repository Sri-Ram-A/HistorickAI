# https://medium.com/@pierrelouislet/getting-started-with-chroma-db-a-beginners-tutorial-6efa32300902
from pprint import pprint
import chromadb
# Initialize the persistent client
client = chromadb.PersistentClient(path=".") # default path is "./chroma_db"
# Create or get a collection
collection = client.get_or_create_collection(name="my_collection")
collection.add(
    documents=[
        "This is a document about machine learning",
        "This is another document about data science",
        "A third document about artificial intelligence"
    ],
    metadatas=[
        {"source": "test1"},
        {"source": "test2"},
        {"source": "test3"}
    ],
    ids=[
        "id1",
        "id2",
        "id3"
    ]
)
results = collection.query(
    query_texts=[
        "This is a query about machine learning and data science"
    ],
    n_results=2
)
pprint(results)
# My output is as follows: - Downloaded /home/srirama/.cache/chroma/onnx_models/all-MiniLM-L6-v2/onnx.tar.gz: 100%|█| 79.3M/79.3M [01:49<00:00, 759kiB/s
# {
#     'ids': [['id1', 'id2']],
#     'distances': [[0.5817214250564575, 0.6953163146972656]],
#     'metadatas': [[{'source': 'test1'}, {'source': 'test2'}]],
#     'embeddings': None,
#     'documents': [['This is a document about machine learning',
#         'This is another document about data science']],
#     'uris': None,
#     'data': None
# }