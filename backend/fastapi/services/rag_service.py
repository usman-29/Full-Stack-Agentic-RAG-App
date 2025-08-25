from services.conversation_service import conversation_service
import sys
import os
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

# Add agentic_rag to path for imports
agentic_rag_path = os.path.join(os.path.dirname(__file__), '../../agentic_rag')
sys.path.insert(0, agentic_rag_path)

try:
    from graph.graph import app as rag_app
    from ingestion import retriever, add_documents_to_retriever
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Make sure agentic_rag is in path: {agentic_rag_path}")
    raise


class RAGService:
    """Service class for RAG operations."""

    def __init__(self):
        self.rag_app = rag_app
        self.retriever = retriever

    async def ask_question(
        self,
        question: str,
        user_id: Optional[int] = None,
        conversation_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Process a question through the RAG system with conversation context.

        Args:
            question: The question to ask
            user_id: ID of the user asking the question
            conversation_id: ID of the conversation (optional)
            db: Database session for conversation management

        Returns:
            Dict containing the result with additional metadata
        """
        try:
            enhanced_question = question
            conversation = None

            # Handle conversation context if user and db provided
            if user_id and db:
                # Get or create conversation
                if conversation_id:
                    conversation = conversation_service.get_conversation(
                        conversation_id, user_id, db)
                    if not conversation:
                        raise ValueError(
                            f"Conversation {conversation_id} not found")
                else:
                    conversation = conversation_service.get_or_create_default_conversation(
                        user_id, db)

                # Load conversation context
                context = conversation_service.get_conversation_context(
                    conversation.id, db)

                # Build enhanced prompt with context
                if context["summary"] or context["recent_messages"]:
                    enhanced_question = conversation_service.build_context_prompt(
                        context, question)

            # Invoke the RAG graph with enhanced question
            result = self.rag_app.invoke(input={"question": enhanced_question})

            # Extract processing info
            route_taken = self._extract_route_info(result)
            documents_used = self._extract_documents_used(result)
            answer = result.get("generation", "No answer generated")

            # Save messages to conversation if context available
            if conversation and db:
                # Save user message
                conversation_service.add_message(
                    conversation.id, "user", question, None, db
                )

                # Save assistant message
                conversation_service.add_message(
                    conversation.id, "assistant", answer, route_taken, db
                )

                # Check if summarization is needed
                conversation_service.check_and_summarize_if_needed(
                    conversation.id, db)

            return {
                "question": question,
                "answer": answer,
                "route_taken": route_taken,
                "documents_used": documents_used,
                "conversation_id": conversation.id if conversation else None,
                "processing_info": {
                    "use_web_search": result.get("use_web_search", False),
                    "documents_count": len(result.get("documents", [])),
                    "context_used": enhanced_question != question,
                    "raw_result": result
                }
            }

        except Exception as e:
            raise Exception(f"Error processing question: {str(e)}")

    def _extract_route_info(self, result: Dict[str, Any]) -> str:
        """Extract the route taken from the RAG result."""
        documents = result.get("documents", [])

        if not documents:
            return "direct_llm"

        # Check if web search was used
        for doc in documents:
            doc_content = str(doc).lower()
            if "tavily" in doc_content or "web search" in doc_content:
                return "web_search"

        return "vectorstore"

    def _extract_documents_used(self, result: Dict[str, Any]) -> Optional[List[str]]:
        """Extract document content from the RAG result."""
        documents = result.get("documents", [])
        if not documents:
            return None

        doc_contents = []
        for doc in documents:
            if hasattr(doc, 'page_content'):
                content = doc.page_content[:200] + "..." if len(
                    doc.page_content) > 200 else doc.page_content
                doc_contents.append(content)
            else:
                content = str(doc)[:200] + \
                    "..." if len(str(doc)) > 200 else str(doc)
                doc_contents.append(content)

        return doc_contents

    async def upload_documents(self, document_paths: List[str]) -> Dict[str, Any]:
        """
        Upload documents to the RAG system.

        Args:
            document_paths: List of paths to documents

        Returns:
            Dict containing upload statistics
        """
        try:
            # Validate paths
            invalid_paths = [
                path for path in document_paths if not os.path.exists(path)]
            if invalid_paths:
                raise ValueError(f"Invalid document paths: {invalid_paths}")

            # Track initial state
            initial_doc_count = self._get_document_count()

            # Add documents
            add_documents_to_retriever(document_paths, self.retriever)

            # Calculate statistics
            final_doc_count = self._get_document_count()
            documents_added = final_doc_count - initial_doc_count
            total_processed = len(document_paths)
            duplicates_filtered = max(0, total_processed - documents_added)

            return {
                "documents_added": documents_added,
                "duplicates_filtered": duplicates_filtered,
                "total_documents_processed": total_processed,
                "total_documents_in_system": final_doc_count
            }

        except Exception as e:
            raise Exception(f"Error uploading documents: {str(e)}")

    def _get_document_count(self) -> int:
        """Get the current number of documents in the system."""
        try:
            if hasattr(self.retriever.docstore, 'store'):
                return len(self.retriever.docstore.store)
            return 0
        except:
            return 0

    async def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics."""
        try:
            doc_count = self._get_document_count()
            vectorstore = self.retriever.vectorstore

            return {
                "total_documents": doc_count,
                "vectorstore_type": type(vectorstore).__name__,
                "embedding_model": "OpenAI Embeddings",
                "chunk_size": 1000,
                "chunk_overlap": 200,
                "retriever_type": "MultiVectorRetriever"
            }
        except Exception as e:
            raise Exception(f"Error getting system stats: {str(e)}")


# Global service instance
rag_service = RAGService()
