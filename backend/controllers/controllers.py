# This file will be used for the controllers
import sys

# allows us to get files from the helpers folder
sys.path.insert(1, "../helpers/")

from models.schemas import UserSchema, MessageSchema
import bcrypt
from helpers.mysqlConnect import DBConnect

def insertUserIntoDB(user_info: UserSchema):
    """
    This function insert the user into the database
    """

    try:
        # get the connection and cursor for the database
        conn, cursor = DBConnect()

        # convert the password into utf-8 formatting
        bytes = user_info.password.encode('utf-8')

        # generate salt for the hashing process
        salt = bcrypt.gensalt()

        # generate a hashed password using the encoded password and the salt
        hash = bcrypt.hashpw(bytes, salt).decode('utf-8')

        # insert the new user in the data with the username and hashed passwords as arguments
        cursor.execute(f"CALL CreateUser('{user_info.username}', '{hash}')")

        # commit this new user to the database
        conn.commit()

        # close the connection
        conn.close()
        
        # return a success message for the user
        return {"user": user_info.username, "status": "success"}
    
    # if an exception
    except Exception as err:
        # print the error
        print(err)
        # return an error message
        return {"user": None, "status": "err"}
    


def verifyLogin(user_info: UserSchema):
    """
    This function verify that the user has entered the correct credentials to log in
    """

    try:

        # get connection and cursor for the database
        conn, cursor = DBConnect()

        # check and see if the username and password of the person is in the database
        cursor.execute(f"SELECT username, passwd FROM users WHERE username = '{user_info.username}'")

        # store the SQL output into a local variable
        user_details = cursor.fetchone()
        
        # store the users password in a local variable
        password = user_info.password

        # encode the password the user gave to utf-8
        bytes = password.encode('utf-8')

        # encode the stored password as utf-8
        formerHash = user_details[1].encode('utf-8')

        # store the SQL output in a dictionary if the passwords match
        if(bcrypt.checkpw(bytes, formerHash)):
            user = { 
                "username": user_details[0], 
                "status": "success"
            }

        # close the connection
        conn.close()

        return user

    except Exception as err:
        # print the error
        print(err)
        # return a error statement
        return {"user": None, "status": "err"}
    
def insertMessageIntoDB(message_info: MessageSchema) -> None:
    try:
        # get connection and cursor for the database
        conn, cursor = DBConnect()

        # check and see if the username and password of the person is in the database
        cursor.execute(f"CALL StoreMessage('{message_info.from_user}', '{message_info.message_content}')")

        # commit new data to database
        conn.commit()

        # close connection
        conn.close()

    except Exception as err:
        print(err)



def retreiveMessages():
    """
    This function will get the messages stored in the mysql database
    """
    try:

        messages = []

        # get connection and cursor for the database
        conn, cursor = DBConnect()

        # check and see if the username and password of the person is in the database
        cursor.execute(f"""
                       
                       SELECT u.username, m.message_content, m.message_date 
                       FROM messages m INNER JOIN users u ON m.from_user = u.user_id
                       ORDER BY m.message_date;  
                       
                       """)

        # for each item revieved from sql append it to the messages list

        for message in cursor:
            messages.append({"user": message[0], "message": message[1]})
        

        # close connection
        conn.close()

        return messages

    except Exception as err:
        print(err)
        return {"messages": None, "status": "Error"}



def getUserImg(username: str):
    """
    This function is used to retreive the users image
    """

    try:
        conn, cursor = DBConnect()

        cursor.execute(f"SELECT img_path FROM users WHERE username = '{username}'")

        image = cursor.fetchone()[0]

        conn.close()

        return {"image": image, "status": "Success"}

    except Exception as err:
        print(err)
        return {"image": None, "status": "Error"}


def InsertImgPathIntoDB(file_name: str, username: str) -> None:
    try:
        img_path = f"./images/{file_name}"

        conn, cursor = DBConnect();

        cursor.execute(
        f"""
        UPDATE users SET img_path = '{img_path}' WHERE username = '{username}'
        """
        )

        conn.commit()

        conn.close()

    
    except Exception as err:
        print(err)

