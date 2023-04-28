#!/bin/zsh

cd server || exit
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
exit
touch .env
echo "TRACKING_NUMBER=""" >> .env
echo "DB_NAME=data.db" >> .env
echo "CREATE_TABLE=CREATE TABLE IF NOT EXISTS tracking (id INTEGER PRIMARY KEY AUTOINCREMENT, tracking_number TEXT, status TEXT, date TEXT)" >> .env
echo "INSERT_DATA=INSERT INTO tracking (tracking_number, status, date) VALUES (?, ?, ?)" >> .env
echo "SELECT_DATA=SELECT * FROM tracking" >> .env
cd ../client || exit
npm install
cd ../
