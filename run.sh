#!/bin/zsh

cd server || exit
source venv/bin/activate
uvicorn api:app --reload --port 8001 &
cd ../client || exit
yarn dev