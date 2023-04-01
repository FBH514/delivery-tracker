import datetime
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response

from app import Database

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_headers="*",
    allow_methods="*",
    allow_origins="*",
)

load_dotenv()
hours = 1

def set_headers(response: Response) -> None:
    """
    Sets the headers for the response.
    :param response: Response
    :return: None
    """
    response.headers['Cache-Control'] = "public, max-age=3600"
    response.headers['Expires'] = (datetime.datetime.now() + datetime.timedelta(hours=1)).strftime("%a, %d %b %Y %H:%M:%S GMT")

version = "v1"
project = "usps-tracking"

@app.get(f"/{project}/{version}/data")
def get_data(response: Response) -> dict:
    """
    Returns the data from the database.
    :param response: Response
    :return: dict
    """
    set_headers(response)
    db = Database(os.getenv("DB_NAME"), os.getenv("CREATE_TABLE"))
    data = db.select(os.getenv("SELECT_ALL"))[-1]
    return {
        "tracking": data[1],
        "content": data[2].split(".")[0],
        "status": data[3],
        "detail": data[4],
        "location": data[5],
        "last_seen": data[6],
        "date": data[7],
        "usps_link": "https://tools.usps.com/go/TrackConfirmAction.action?tLabels=" + data[1]
    }