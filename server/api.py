import os
import functools
import subprocess

from dotenv import load_dotenv

# import fastapi from virtual environment
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
from starlette.requests import Request

from app import Database

load_dotenv()


class Project:
    """Project's constants defined in an enum class."""
    NAME: str = "tracking"
    VERSION: str = "v1"
    USPS_LINK: str = "https://tools.usps.com/go/TrackConfirmAction.action?tLabels="


class Queries:
    """Project's constant Database queries defined in an enum class"""
    DB_NAME: str = os.getenv("DB_NAME")
    CREATE_TABLE: str = os.getenv("CREATE_TABLE")
    SELECT_DELIVERY: str = os.getenv("SELECT_DELIVERY")
    SELECT_DELIVERIES: str = "SELECT tracking_number from deliveries"


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_headers="*",
    allow_methods="*",
    allow_origins="*",
    allow_credentials=True
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

def run_service(service: str, number: str) -> None:
    """
    Runs the tracking number's service.
    :param service: str
    :param number: str
    :return: None
    """
    subprocess.run(["python3", "main.py", service, number])


@app.post(f"/{Project.NAME}/{Project.VERSION}/run/")
async def start_service(request: Request) -> dict:
    """
    Starts the tracking number's service.
    :return: None
    """
    data = await request.json()
    service, number = data.get("deliveryService"), data.get("trackingNumber")
    if number == "Loading".casefold(): return {"status": "error"}
    with Database(Queries.DB_NAME, Queries.CREATE_TABLE) as db:
        numbers = db.select(Queries.SELECT_DELIVERIES)[0]
        if not number in numbers: return {"status": "error"}
    print("Starting service: {} with number: {}".format(service, number))
    run_service(service, number)
    return {"status": "{} was started successfully".format(number)}


@cache(15)
@app.get("/tracking/v1/data/{delivery_service}/{tracking_number}")
async def get_data(response: Response, tracking_number: str) -> dict:
    """
    Returns the data from the database.
    :param response: Response
    :param tracking_number: str
    :return: dict
    """
    with Database(
            Queries.DB_NAME,
            Queries.CREATE_TABLE
    ) as db:
        numbers = db.select(Queries.SELECT_DELIVERIES)[0]

        if tracking_number not in numbers:
            return {}

            # implement more logic here
            # thread get request to usps url
            # insert data into db, then run what's below

    with Database(Queries.DB_NAME, Queries.CREATE_TABLE) as db:
        try:
            data = db.select(Queries.SELECT_DELIVERY, {'tracking_number': tracking_number})[0]
        except Exception as e:
            print(e)
            return {}
        return {
            "tracking": data[1],
            "content": data[2].split(".")[0],
            "status": data[3],
            "detail": data[4],
            "location": data[5],
            "last_seen": data[6],
            "date": data[7],
            "usps_link": Project.USPS_LINK + data[1]
        }
