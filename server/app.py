import datetime
import os
import re
import sqlite3

from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from requests import Response
from abc import ABC, abstractmethod


class FetchStrategy(ABC):
    """Defines the FetchStrategy interface."""

    @abstractmethod
    def __init__(self, tracking_number: str) -> None:
        pass

    @abstractmethod
    def __str__(self) -> str:
        pass

    @property
    @abstractmethod
    def tracking_number(self) -> str:
        pass

    @abstractmethod
    def get(self, tracking_number: str) -> Response:
        pass

    @abstractmethod
    def parse_content(self) -> str:
        pass

    @abstractmethod
    def parse_status(self) -> str:
        pass

    @abstractmethod
    def parse_detail(self) -> str:
        pass

    @abstractmethod
    def parse_location(self) -> str:
        pass

    @abstractmethod
    def parse_last_seen(self) -> str:
        pass

    @abstractmethod
    def data(self) -> dict:
        pass


class USPS(FetchStrategy):
    """Defines the USPS Object, implements FetchStrategy."""

    def __init__(self, tracking_number) -> None:
        """
        Constructor for the Fetch Object.
        """
        load_dotenv()
        self._tracking_number = tracking_number
        self.BASE_URL = "https://tools.usps.com/go/TrackConfirmAction.action?tLabels="
        self.response = self.get(self._tracking_number)
        if self.response.status_code != 200:
            raise ValueError("{} returns a 404.".format(tracking_number))
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


class Fetch:
    """Defines the Fetch context object."""

    def __init__(self, strategy: FetchStrategy) -> None:
        """
        Constructor for the Fetch object.
        :param strategy: FetchStrategy
        """
        self.strategy = strategy

    def __str__(self) -> str:
        """
        String representation of the Fetch object.
        :return: str
        """
        pass

    def tracking_number(self) -> str:
        """
        Returns the tracking number.
        :return: str
        """
        return self.strategy.tracking_number

    def get(self, tracking_number: str) -> Response:
        """
        Makes a GET request.
        :param tracking_number: str
        :return: Response
        """
        return self.strategy.get(tracking_number)

    def parse_content(self) -> str:
        """
        Parses the content from the BeautifulSoup object.
        :return: str
        """
        return self.strategy.parse_content()

    def parse_status(self) -> str:
        """
        Parses the status from the BeautifulSoup object.
        :return: str
        """
        return self.strategy.parse_status()

    def parse_detail(self) -> str:
        """
        Parses the detail from the BeautifulSoup object.
        :return: str
        """
        return self.strategy.parse_detail()

    def parse_location(self) -> str:
        """
        Parses the location from the BeautifulSoup object.
        :return: str
        """
        return self.strategy.parse_location()

    def parse_last_seen(self) -> str:
        """
        Parses the last seen date from the BeautifulSoup object.
        :return: str
        """
        return self.strategy.parse_last_seen()

    def data(self) -> dict:
        """
        Returns the data from the Fetch object.
        :return: dict
        """
        return self.strategy.data()


class Database:
    """Defines the Database object."""
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
        self.conn = sqlite3.connect(self.name)
        self.cursor = self.conn.cursor()
        self.cursor.execute(sql)
        self.conn.commit()

    def __str__(self) -> str:
        """
        String representation of the Database object.
        :return: str
        """
        return self.name

    def __enter__(self) -> 'Database':
        """
        Opens the connection to the database.
        :return: Database
        """
        return self

    def __exit__(self, exc_type: Exception, exc_val: Exception, exc_tb: Exception) -> None:
        """
        Closes the connection to the database.
        :param exc_type: Exception
        :param exc_val: Exception
        :param exc_tb: Exception
        :return: None
        """
        self.conn.close()

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

    def select(self, sql: str, data: dict = None) -> list:
        """
        Selects from the database.
        :param sql: str
        :param data: dict, default None
        :return: list
        """
        with self.conn:
            if not data:
                self.cursor.execute(sql)
            else:
                self.cursor.execute(sql, data)
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
    """Defines the App object"""

    def __init__(self, delivery_service: str, tracking_number: str) -> None:
        """
        Constructor for the App object.
        """
        load_dotenv()
        if re.match(r"^us", delivery_service, re.IGNORECASE):
            self.delivery_service = USPS
        else:
            raise ValueError("Delivery Service is not supported.")
        self.tracking_number = tracking_number
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
        row = self.database.select(
            """SELECT * FROM deliveries WHERE tracking_number = :tracking_number""", {
                "tracking_number": data["tracking_number"]
            })[0]
        if not row:
            self.database.insert(os.getenv("INSERT_STATUS"), data)
            return
        self.database.update(
            """
            UPDATE deliveries
            SET status = :status, content = :content, detail = :detail, location = :location, last_seen = :last_seen, date = :date WHERE tracking_number = :tracking_number
            """,
            data
        )

    @staticmethod
    def console(data: dict) -> None:
        """
        Prints data to the console.
        :param data: dict
        :return: None
        """
        print(f"Last Status for Tracking Number {data['tracking_number']} —> {data['status']}")
        print(f"{data['content']}")
        print(f"{data['detail']}: {data['location']}")
        print(f"Last Seen on {data['last_seen']}")

    def run(self) -> None:
        """
        Runs the app.
        :return: None
        """
        fetch = Fetch(self.delivery_service(self.tracking_number))
        data = fetch.data()
        self.console(data)
        message = "Saving results."
        self.save_data(data)
        print(self.seperator * len(message))
        print(message)
        print()
