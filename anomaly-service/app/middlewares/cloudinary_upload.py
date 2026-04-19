from io import BytesIO

import cloudinary
import cloudinary.uploader
from fastapi import File, HTTPException, Request, UploadFile

from app.constants.config import (
    ALLOWED_IMAGE_TYPES,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    DEFAULT_CLOUDINARY_FOLDER,
    MAX_IMAGE_SIZE_BYTES,
)

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)

async def upload_single_image_middleware(
    request: Request,
    screenshot: UploadFile | None = File(default=None),
    image: UploadFile | None = File(default=None),
    folder: str = DEFAULT_CLOUDINARY_FOLDER,
) -> str | None:
    image_file = screenshot or image

    if image_file is None:
        request.state.uploaded_image_url = None
        return None

    if image_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_bytes = await image_file.read()
    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 5MB or smaller")

    try:
        result = cloudinary.uploader.upload(
            BytesIO(file_bytes),
            folder=folder,
            resource_type="image",
        )
        image_url = result.get("secure_url")
        if not image_url:
            raise HTTPException(status_code=500, detail="Cloudinary upload failed")

        request.state.uploaded_image_url = image_url
        return image_url
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to upload image") from exc
