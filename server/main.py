import asyncio
import sys

from dotenv import load_dotenv

from app import App

load_dotenv()
delivery_service: str = sys.argv[1]
tracking_number: str = sys.argv[2]

if __name__ == '__main__':
    asyncio.run(App(delivery_service, tracking_number).run())
