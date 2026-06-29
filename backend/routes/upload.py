"""Upload routes — Local file uploads."""
import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request
from backend.utils.firebase_verify import get_current_user_uid

router = APIRouter(prefix="/api/upload", tags=["Upload"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_DOC_TYPES = {"application/pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def sanitize_filename(filename: str) -> str:
    name = "".join(c for c in filename if c.isalnum() or c in ".-_")
    return name or "file"


async def upload_file(request: Request, file: UploadFile, folder: str, allowed_types: set) -> str:
    if file.content_type not in allowed_types:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(allowed_types)}")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Max 5MB.")
    
    ext = os.path.splitext(file.filename or "file")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    
    # Check for Azure Blob Storage configuration
    azure_conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if azure_conn_str:
        try:
            from azure.storage.blob import BlobServiceClient
            container_name = os.getenv("AZURE_STORAGE_CONTAINER", "alumni-uploads")
            blob_service_client = BlobServiceClient.from_connection_string(azure_conn_str)
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=f"{folder}/{filename}")
            blob_client.upload_blob(content, overwrite=True)
            return blob_client.url
        except Exception as e:
            # Fall back to local storage if Azure upload fails to prevent service crashes
            print(f"[AZURE BLOB ERROR] Failed uploading to Azure, falling back to local: {e}")

    # Local Storage
    target_dir = os.path.join("uploads", folder)
    os.makedirs(target_dir, exist_ok=True)
    
    filepath = os.path.join(target_dir, filename)
    with open(filepath, "wb") as f:
        f.write(content)
        
    base_url = str(request.base_url).rstrip("/")
    return f"{base_url}/uploads/{folder}/{filename}"



@router.post("/photo")
async def upload_photo(request: Request, file: UploadFile = File(...), uid: str = Depends(get_current_user_uid)):
    url = await upload_file(request, file, f"photos/{uid}", ALLOWED_IMAGE_TYPES)
    return {"url": url}


@router.post("/resume")
async def upload_resume(request: Request, file: UploadFile = File(...), uid: str = Depends(get_current_user_uid)):
    url = await upload_file(request, file, f"resumes/{uid}", ALLOWED_DOC_TYPES)
    return {"url": url}


@router.post("/document")
async def upload_document(request: Request, file: UploadFile = File(...), uid: str = Depends(get_current_user_uid)):
    all_types = ALLOWED_IMAGE_TYPES | ALLOWED_DOC_TYPES
    url = await upload_file(request, file, f"documents/{uid}", all_types)
    return {"url": url}
