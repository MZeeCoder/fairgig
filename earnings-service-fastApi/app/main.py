from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config.db import connect_to_mongo
from app.modules.anomaly_detection.route import anomaly_router
from app.modules.earnings.route import earnings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
	await connect_to_mongo()
	yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(earnings_router)
app.include_router(anomaly_router)


@app.get("/")
async def root():
	return {"message": "FastAPI service running"}
