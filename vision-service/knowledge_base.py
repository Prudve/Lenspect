import string
from rank_bm25 import BM25Okapi

# 1. Statutory Chunks (The "Library")
LEGAL_METROLOGY_RULES = [
    {
        "id": "Rule 6(1)(a)",
        "text": "Rule 6(1)(a): Every package shall bear the name and complete address of the manufacturer, or where the manufacturer is not the packer, the name and address of the manufacturer and packer."
    },
    {
        "id": "Rule 6(1)(b)",
        "text": "Rule 6(1)(b): Every package shall bear the common or generic name of the commodity contained in the package."
    },
    {
        "id": "Rule 6(1)(c)",
        "text": "Rule 6(1)(c): Every package shall bear the net quantity, in terms of the standard unit of weight or measure, of the commodity."
    },
    {
        "id": "Rule 6(1)(e)",
        "text": "Rule 6(1)(e): Every package shall bear the retail sale price of the package in the format: 'Maximum or Max. retail price Rs. ... / ₹ ... inclusive of all taxes'."
    },
    {
        "id": "Rule 13",
        "text": "Rule 13: Statement of units of weight, measure or number. The symbol for units shall not be in plural form (e.g., 'g' not 'gms', 'kg' not 'kgs', 'ml' not 'mls'). No full stop shall follow the symbol except at the end of a sentence."
    }
]

# 2. Tokenizer helper
def tokenize(text: str) -> list[str]:
    # Lowercase and remove punctuation for better matching
    text = text.lower().translate(str.maketrans('', '', string.punctuation))
    return text.split()

# 3. Build the BM25 Index in-memory on startup
corpus = [chunk["text"] for chunk in LEGAL_METROLOGY_RULES]
tokenized_corpus = [tokenize(doc) for doc in corpus]
bm25_index = BM25Okapi(tokenized_corpus)

# 4. The Retrieval Function (The "Librarian")
def retrieve_relevant_rules(ocr_text: str, top_k: int = 3) -> list[str]:
    """
    Takes the messy OCR text, tokenizes it, and retrieves the most 
    relevant legal rules using BM25 semantic ranking.
    """
    tokenized_query = tokenize(ocr_text)
    # Get top matching rule strings
    retrieved_docs = bm25_index.get_top_n(tokenized_query, corpus, n=top_k)
    return retrieved_docs