import os
import string

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
        self.BASE_URL = "https://tools.usps.com/go/TrackConfirmAction.action?tLabels="
        self.response = self.get(os.getenv("TRACKING_NUMBER"))
        self.soup = BeautifulSoup(self.response.text, "html.parser")

    def __str__(self):
        pass

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

    def parse_date(self) -> str:
        """
        Parses the date from the BeautifulSoup object.
        :return: str
        """
        date = "tb-date"
        return self.soup.find("p", {"class": date}).text.strip()


class Database:

    def __init__(self):
        pass

    def __str__(self):
        pass

    def insert(self):
        pass

    def select(self):
        pass

    def update(self):
        pass

    def delete(self):
        pass


if __name__ == '__main__':

    load_dotenv()
    fetch = Fetch()
    print(fetch.parse_status())
    print(fetch.parse_detail())
    print(fetch.parse_location())
    print(fetch.parse_date())
