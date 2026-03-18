import mysql.connector
import os
from dotenv import load_dotenv

# load .env file
load_dotenv()

connection = mysql.connector.connect(
    host = os.getenv("db_host"),
    user = os.getenv("db_user"),
    password = os.getenv("db_password"),
    database = os.getenv("db_database")
)

if connection.is_connected():
   print("Database Connected Successfully")

cursor = connection.cursor()