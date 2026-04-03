from docling.document_converter import DocumentConverter
from pprint import pprint

converter = DocumentConverter()

# Basic PDF extraction
result = converter.convert("https://arxiv.org/pdf/2408.09869")

document = result.document
markdown_output = document.export_to_markdown()
json_output = document.export_to_dict()

pprint(json_output)
pprint(markdown_output)

## Basic HTML extraction
# result = converter.convert("https://ds4sd.github.io/docling/")

# document = result.document
# markdown_output = document.export_to_markdown()
# pprint(markdown_output)

