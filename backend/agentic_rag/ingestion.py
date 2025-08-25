import hashlib
import os
import uuid
from typing import List, Set

from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain.storage import InMemoryStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings


# Global set to track document hashes for duplicate detection
document_hashes: Set[str] = set()


def get_document_hash(content: str) -> str:
    """
    Generate a hash for document content to detect duplicates.

    Args:
        content: Document content to hash

    Returns:
        SHA256 hash of the content
    """
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def is_duplicate_document(document: Document) -> bool:
    """
    Check if a document is a duplicate based on content hash.

    Args:
        document: Document to check

    Returns:
        True if document is a duplicate, False otherwise
    """
    content_hash = get_document_hash(document.page_content)
    if content_hash in document_hashes:
        return True
    document_hashes.add(content_hash)
    return False


def load_documents(directory_path: str = "documents") -> List[Document]:
    """
    Load documents from a directory, filtering out duplicates.

    Args:
        directory_path: Path to directory containing documents

    Returns:
        List of loaded documents without duplicates
    """
    if not os.path.exists(directory_path):
        print(
            f"Directory {directory_path} not found. Creating empty directory.")
        os.makedirs(directory_path, exist_ok=True)
        return []

    loader = DirectoryLoader(
        directory_path,
        loader_cls=TextLoader,
        glob="**/*.txt",
        loader_kwargs={"encoding": "utf-8"}
    )
    documents = loader.load()

    # Filter out duplicate documents
    unique_documents = []
    duplicates_found = 0

    for doc in documents:
        if not is_duplicate_document(doc):
            unique_documents.append(doc)
        else:
            duplicates_found += 1

    print(
        f"Loaded {len(unique_documents)} unique documents from {directory_path}")
    if duplicates_found > 0:
        print(f"Filtered out {duplicates_found} duplicate documents")

    return unique_documents


def create_multi_vector_retriever(
    documents: List[Document],
    persist_directory: str = "chroma_db"
) -> MultiVectorRetriever:
    """
    Create and populate MultiVectorRetriever with duplicate prevention.

    Args:
        documents: Documents to add to vectorstore
        persist_directory: Directory to persist the vectorstore

    Returns:
        MultiVectorRetriever instance
    """
    embeddings = OpenAIEmbeddings()

    # Create the vector store for chunks
    vectorstore = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )

    # Create the document store for full documents
    store = InMemoryStore()

    # Create MultiVectorRetriever
    retriever = MultiVectorRetriever(
        vectorstore=vectorstore,
        docstore=store,
        id_key="doc_id"
    )

    if documents:
        # Add documents with unique IDs
        doc_ids = []
        chunks_to_add = []

        for doc in documents:
            # Generate unique ID for each document
            doc_id = str(uuid.uuid4())
            doc_ids.append(doc_id)

            # Store the full document in docstore
            store.mset([(doc_id, doc)])

            # Create chunks for this document
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )

            chunks = text_splitter.split_documents([doc])

            # Add doc_id to each chunk's metadata
            for chunk in chunks:
                chunk.metadata["doc_id"] = doc_id

            chunks_to_add.extend(chunks)

        # Add chunks to vectorstore
        if chunks_to_add:
            retriever.vectorstore.add_documents(chunks_to_add)

        print(
            f"Created MultiVectorRetriever with {len(documents)} documents and {len(chunks_to_add)} chunks")

    return retriever


def load_or_create_multi_vector_retriever(
    documents_dir: str = "documents",
    persist_directory: str = "chroma_db"
) -> MultiVectorRetriever:
    """
    Load existing MultiVectorRetriever or create new one from documents.

    Args:
        documents_dir: Directory containing source documents
        persist_directory: Directory to persist vectorstore

    Returns:
        MultiVectorRetriever instance
    """
    embeddings = OpenAIEmbeddings()

    # Check if vectorstore already exists
    if os.path.exists(persist_directory):
        print(f"Loading existing vectorstore from {persist_directory}")
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=embeddings
        )

        # Create MultiVectorRetriever with existing vectorstore
        store = InMemoryStore()
        retriever = MultiVectorRetriever(
            vectorstore=vectorstore,
            docstore=store,
            id_key="doc_id"
        )
        return retriever

    # Create new MultiVectorRetriever
    print("Creating new MultiVectorRetriever...")
    documents = load_documents(documents_dir)

    if not documents:
        print("No documents found. Creating empty MultiVectorRetriever.")
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=embeddings
        )
        store = InMemoryStore()
        retriever = MultiVectorRetriever(
            vectorstore=vectorstore,
            docstore=store,
            id_key="doc_id"
        )
        return retriever

    retriever = create_multi_vector_retriever(documents, persist_directory)
    return retriever


def add_documents_to_retriever(
    document_paths: List[str],
    retriever: MultiVectorRetriever
) -> None:
    """
    Add new documents to existing MultiVectorRetriever with duplicate detection.

    Args:
        document_paths: List of paths to documents to add
        retriever: Existing MultiVectorRetriever to add documents to
    """
    new_documents = []

    for path in document_paths:
        if os.path.isfile(path):
            loader = TextLoader(path, encoding="utf-8")
            docs = loader.load()
            new_documents.extend(docs)
        elif os.path.isdir(path):
            docs = load_documents(path)
            new_documents.extend(docs)

    # Filter out duplicates
    unique_documents = []
    duplicates_found = 0

    for doc in new_documents:
        if not is_duplicate_document(doc):
            unique_documents.append(doc)
        else:
            duplicates_found += 1

    if unique_documents:
        chunks_to_add = []

        for doc in unique_documents:
            # Generate unique ID for each document
            doc_id = str(uuid.uuid4())

            # Store the full document in docstore
            retriever.docstore.mset([(doc_id, doc)])

            # Create chunks for this document
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )

            chunks = text_splitter.split_documents([doc])

            # Add doc_id to each chunk's metadata
            for chunk in chunks:
                chunk.metadata["doc_id"] = doc_id

            chunks_to_add.extend(chunks)

        # Add chunks to vectorstore
        retriever.vectorstore.add_documents(chunks_to_add)
        print(
            f"Added {len(unique_documents)} new documents and {len(chunks_to_add)} chunks to retriever")

        if duplicates_found > 0:
            print(f"Filtered out {duplicates_found} duplicate documents")
    else:
        print("No new documents to add")


# Initialize the MultiVectorRetriever
retriever = load_or_create_multi_vector_retriever()

print("Ingestion setup complete. MultiVectorRetriever with duplicate detection ready for use.")
