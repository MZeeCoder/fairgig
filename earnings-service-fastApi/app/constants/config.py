from dotenv import load_dotenv
from os import getenv


load_dotenv()

MONGO_URI = getenv("MONGO_URI")
MONGO_DB_NAME = getenv("MONGO_DB_NAME")
NODE_ENV = getenv("NODE_ENV", "development")
FRONTEND_URL = getenv("FRONTEND_URL", "http://localhost:3000")
FRONTEND_URL_PRODUCTION = getenv(
	"FRONTEND_URL_PRODUCTION", "https://fairgig-production.up.railway.app"
)
JWT_SECRET = getenv("JWT_SECRET")
JWT_ALGORITHM = getenv("JWT_ALGORITHM", "HS256")

CLOUDINARY_CLOUD_NAME = getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = getenv("CLOUDINARY_API_SECRET")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
DEFAULT_CLOUDINARY_FOLDER = "fairgig/uploads"