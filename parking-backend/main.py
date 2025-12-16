from fastapi import FastAPI
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Optional

# --- CONFIGURATION BASE DE DONNÉES ---
class ParkingSpot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    latitude: float
    longitude: float
    message: str = "Place libre"
    status: str = "libre"
    created_at: str 

# Création du fichier de base de données
engine = create_engine("sqlite:///parking.db")
SQLModel.metadata.create_all(engine)

app = FastAPI()

# --- ROUTES ---
@app.get("/")
def home():
    return {"message": "API Parking avec Base de Données SQLite !"}

@app.post("/report")
def report_parking(spot: ParkingSpot):
    with Session(engine) as session:
        session.add(spot)
        session.commit()
        session.refresh(spot)
        return spot

@app.get("/parkings")
def get_parkings():
    with Session(engine) as session:
        statement = select(ParkingSpot)
        results = session.exec(statement).all()
        return results