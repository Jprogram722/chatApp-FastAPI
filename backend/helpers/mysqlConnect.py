import mysql.connector as mysql_conn
from dotenv import load_dotenv
import os

load_dotenv("../.env")

def DBConnect():
    try:
        # connect to the mysql database
        conn = mysql_conn.connect(
            host="localhost",
            user=os.getenv('SQL_USERNAME'),
            password=os.getenv('SQL_PASSWORD'),
            database="chatDB"
        )

        # create the cursor
        cursor = conn.cursor()
    except Exception as err:
        print(err)
        conn = None
        cursor = None

    return conn, cursor

