import datetime
import os
import re
import sqlite3
import asyncio

from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from requests import Response


class Fetch:

    def __init__(self) -> None:
        """
        Constructor for the Fetch Object.
        """
        load_dotenv()
        self._tracking_number = os.getenv("TRACKING_NUMBER")
        self.BASE_URL = "https://tools.usps.com/go/TrackConfirmAction.action?tLabels="
        self.response = self.get(self._tracking_number)
        self.soup = BeautifulSoup(self.response.text, "html.parser")

    def __str__(self) -> str:
        """
        String representation of the Fetch object.
        :return: str
        """
        return self.BASE_URL

    @property
    def tracking_number(self) -> str:
        """
        Returns the tracking number.
        :return: str
        """
        return self._tracking_number

    def get(self, tracking_number: str) -> Response:
        """
        Makes a GET request
        :param tracking_number: str
        :return: Response
        """
        response = requests.get(self.BASE_URL + tracking_number, allow_redirects=True, headers={
            "User-Agent": os.getenv("USER_AGENT")
        })
        if not response.ok:
            raise Exception("Error: " + str(response.status_code))
        return response

    def parse_content(self) -> str:
        """
        Parses the content from the BeautifulSoup object.
        :return: str
        """
        content = "banner-content"
        return self.soup.find("p", {"class": content}).text.strip()

    def parse_status(self) -> str:
        """
        Parses the status from the BeautifulSoup object.
        :return: str
        """
        status = "tb-status"
        return self.soup.find("p", {"class": status}).text.strip()

    def parse_detail(self) -> str:
        """
        Parses the detail from the BeautifulSoup object.
        :return: str
        """
        detail = "tb-status-detail"
        return self.soup.find("p", {"class": detail}).text.strip()

    def parse_location(self) -> str:
        """
        Parses the location from the BeautifulSoup object.
        :return: str
        """
        location = "tb-location"
        return self.soup.find("p", {"class": location}).text.strip()

    def parse_last_seen(self) -> str:
        """
        Parses the last seen date from the BeautifulSoup object.
        :return: str
        """
        date = "tb-date"
        date = self.soup.find("p", {"class": date}).text.strip()
        date = re.findall(r'\S+', date)
        return " ".join(date)

    def data(self) -> dict:
        """
        Returns the data from the Fetch object.
        :return: dict
        """
        return {
            "tracking_number": self.tracking_number,
            "content": self.parse_content(),
            "status": self.parse_status(),
            "detail": self.parse_detail(),
            "location": self.parse_location(),
            "last_seen": self.parse_last_seen()
        }


class Database:

    instance = None
    ext = ".db"

    def __new__(cls, *args, **kwargs) -> 'Database':
        """
        Singleton pattern for the Database object.
        :param args: list
        :param kwargs: dict
        """
        if not cls.instance:
            cls.instance = super().__new__(cls)
        return cls.instance

    def __init__(self, name: str, sql: str) -> None:
        """
        Constructor for the Database object.
        :param name: str
        :param sql: str
        """
        if not name.endswith(self.ext):
            raise ValueError("{} must end with {}".format(name, self.ext))
        self.name = name
        self.conn = sqlite3.connect(name)
        self.cursor  = self.conn.cursor()
        self.cursor.execute(sql)
        self.conn.commit()

    def __str__(self) -> str:
        """
        String representation of the Database object.
        :return: str
        """
        return self.name

    def insert(self, sql: str, data: dict) -> None:
        """
        Inserts into the database.
        :param sql: str
        :param data: dict
        :return: None
        """
        with self.conn:
            self.cursor.execute(sql, data)
        self.conn.commit()

    def select(self, sql: str) -> list:
        """
        Selects from the database.
        :param sql: str
        :return: list
        """
        with self.conn:
            self.cursor.execute(sql)
        return self.cursor.fetchall()

    def update(self, sql: str, data: dict) -> None:
        """
        Updates the database.
        :param sql: str
        :param data: dict
        :return: None
        """
        with self.conn:
            self.cursor.execute(sql, data)
        self.conn.commit()

    def delete(self, sql: str, data: dict) -> None:
        """
        Deletes from the database.
        :param sql: str
        :param data: dict
        :return:
        """
        with self.conn:
            self.cursor.execute(sql, data)
        self.conn.commit()


class App:

    def __init__(self) -> None:
        """
        Constructor for the App object.
        """
        load_dotenv()
        self.sleep = 15 * 60
        self.seperator = "—"
        self.database = Database(os.getenv("DB_NAME"), os.getenv("CREATE_TABLE"))

    def __str__(self) -> str:
        """
        String representation of the App object.
        :return: str
        """
        return "App fetches data from USPS."

    def save_data(self, data: dict) -> None:
        """
        Saves the data to the database.
        :param data: dict
        :return: None
        """
        data.update({"date": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M")})
        self.database.insert(os.getenv("INSERT_STATUS"), data)

    async def run(self) -> None:
        """
        Runs the app.
        :return: None
        """
        while True:
            fetch = Fetch()
            data = fetch.data()
            print(f"Last Status for Tracking Number {data['tracking_number']} —> {data['status']}")
            print(f"{data['content']}")
            print(f"{data['detail']}: {data['location']}")
            print(f"Last Seen on {data['last_seen']}")
            message = f"Saving results.\nFetching new data in {int(self.sleep / 60)} minutes."
            self.save_data(data)
            print(self.seperator * len(message))
            print(message)
            print()
            await asyncio.sleep(self.sleep)
