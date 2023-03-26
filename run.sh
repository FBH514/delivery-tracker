#!/bin/zsh

python3 main.py &
uvicorn api:app --reload &
cd gui/src || exit
npm run start