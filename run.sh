#!/bin/zsh

cd server || exit
uvicorn api:app --reload --port 8001 &
cd ../client || exit
yarn dev