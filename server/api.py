import functools
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response

from app import Database

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_headers="*",
    allow_methods="*",
    allow_origins="*",
)

def cache(minutes: int) -> callable:
    def decorator(func) -> callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> callable:
            response = args[0]
            response.headers['Cache-Control'] = "public, max-age={}".format(minutes)
            return func(*args, **kwargs)
        return wrapper
    return decorator

version = "v1"
project = "tracking"

@cache(15)
@app.get(f"/{project}/{version}/data")
def get_data(response: Response) -> dict:
    """
    Returns the data from the database.
    :param response: Response
    :return: dict
    """
    with Database(os.getenv("DB_NAME"), os.getenv("CREATE_TABLE")) as db:
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
