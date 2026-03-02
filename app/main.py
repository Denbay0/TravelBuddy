from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.db.database import Base, engine
from app.db import models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TravelBuddy Auth MVP", version="0.1.0")
app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "TravelBuddy auth service is running"}
