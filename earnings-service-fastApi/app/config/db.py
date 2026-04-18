from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.constants.config import MONGO_DB_NAME, MONGO_URI
from app.modules.earnings.model import Earnings


client = None


async def connect_to_mongo():
    global client

    if not MONGO_URI:
        raise RuntimeError("MONGO_URI is missing")

    client = AsyncIOMotorClient(MONGO_URI)
    database_name = MONGO_DB_NAME

    if not database_name:
        try:
            database_name = client.get_default_database().name
        except Exception:
            database_name = "fairgig"

    database = client[database_name]
    await init_beanie(database=database, document_models=[Earnings])