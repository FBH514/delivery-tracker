import asyncio
import sys

from app import App

delivery_service = sys.argv[1]

if __name__ == '__main__':
    asyncio.run(App(delivery_service).run())
