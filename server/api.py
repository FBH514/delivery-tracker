import asyncio
import os
import functools
import subprocess

from dotenv import load_dotenv
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


@app.post(f"/{Project.NAME}/{Project.VERSION}/run/")
async def start_service(request: Request) -> None:
    """
    Starts the tracking number's service.
    :return: None
    """
    data = await request.json()
    service = data.get("deliveryService")
    number = data.get("trackingNumber")
    if not service and not number:
        raise ValueError("Invalid Service {} or Number {}".format(service, number))
    process = await asyncio.create_subprocess_exec("python3", "main.py", f"{service}", f"{number}")
    await process.wait()


@cache(15)
@app.get("/tracking/v1/data/{delivery_service}/{tracking_number}")
async def get_data(response: Response, tracking_number: str) -> dict:
    """
    Returns the data from the database.
    :param response: Response
    :param tracking_number: str
    :return: dict
    """
    if not len(tracking_number) == 13:
        return {}
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
