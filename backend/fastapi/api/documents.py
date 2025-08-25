import os
import tempfile
import shutil
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File

from models.schemas import DocumentUploadRequest, DocumentUploadResponse
from services.rag_service import rag_service

documents_router = APIRouter()


@documents_router.post("/upload", response_model=DocumentUploadResponse)
async def upload_documents(request: DocumentUploadRequest):
    """
    Upload documents to the RAG system.
    
    The system will:
    1. Load documents from provided paths
    2. Check for duplicates using content hashing
    3. Add unique documents to the MultiVectorRetriever
    4. Return upload statistics
    """
    try:
        result = await rag_service.upload_documents(request.document_paths)
        
        return DocumentUploadResponse(
            message="Documents processed successfully",
            documents_added=result["documents_added"],
            duplicates_filtered=result["duplicates_filtered"],
            total_documents_processed=result["total_documents_processed"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@documents_router.post("/upload-files", response_model=DocumentUploadResponse)
async def upload_document_files(files: List[UploadFile] = File(...)):
    """
    Upload document files directly to the RAG system.
    
    Accepts multiple text files and processes them for the knowledge base.
    """
    try:
        uploaded_paths = []
        
        # Save uploaded files to temporary directory
        temp_dir = tempfile.mkdtemp()
        
        try:
            for file in files:
                # Validate file type
                if not file.filename.endswith('.txt'):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Only .txt files are supported. Got: {file.filename}"
                    )
                
                # Save file
                file_path = os.path.join(temp_dir, file.filename)
                with open(file_path, 'wb') as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                uploaded_paths.append(file_path)
            
            # Process uploaded files
            result = await rag_service.upload_documents(uploaded_paths)
            
            return DocumentUploadResponse(
                message=f"Successfully processed {len(files)} uploaded files",
                documents_added=result["documents_added"],
                duplicates_filtered=result["duplicates_filtered"],
                total_documents_processed=result["total_documents_processed"]
            )
            
        finally:
            # Clean up temporary files
            shutil.rmtree(temp_dir, ignore_errors=True)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing uploaded files: {str(e)}"
        )


@documents_router.get("/stats")
async def get_document_stats():
    """Get statistics about the document collection."""
    try:
        return await rag_service.get_system_stats()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
