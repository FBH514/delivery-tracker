#!/bin/zsh

cd server || exit
python3 main.py usps &
uvicorn api:app --reload --port 8001 &
cd ../client/src || exit
npm run start