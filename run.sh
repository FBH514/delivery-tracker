#!/bin/zsh

cd server || exit
python3 main.py usps "LM334290305US" &
uvicorn api:app --reload --port 8001 &
cd ../client || exit
yarn dev