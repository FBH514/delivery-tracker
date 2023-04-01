#!/bin/zsh

python3 main.py &
uvicorn api:app --reload --port 8001 &
cd gui/src || exit
npm run start