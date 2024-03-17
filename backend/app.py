"""
Author: Jared Park
Date: March 8th 2024
Description: This is the file that funs the api it handles all the routing for different api endpoints
"""

# import modules
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile
from helpers.ConnManager import ConnectionManager
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from models.schemas import UserSchema, MessageSchema
from controllers.controllers import (
    insertUserIntoDB, 
    verifyLogin, 
    insertMessageIntoDB, 
    retreiveMessages,
    getUserImg,
    InsertImgPathIntoDB
)

# init a fastapi api
app = FastAPI()

# allow cors between the browser an the api
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://192.168.2.29:5000",
        "http://10.13.232.26:5000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# init a connection manager for the websockets
manager = ConnectionManager()

# endpoint for creating a user
@app.post('/signup/')
def createUser(user_info: UserSchema) -> dict:
    res = insertUserIntoDB(user_info)
    return res

# endpoint for logging in
@app.post('/login/')
def LoginUser(user_info: UserSchema) -> dict:
    res = verifyLogin(user_info)
    return res

# endpoint for sending a message
@app.post('/send-message/')
def receiveMessage(message_info: MessageSchema) -> None:
    insertMessageIntoDB(message_info)

# endpoint for getting messages
@app.get('/get-messages/')
def getMessages() -> list[dict]:
    return retreiveMessages()

@app.post('/select-image/{username}')
async def selectImage(image: UploadFile, username: str):
    # await the image data
    data = await image.read()
    # get the path to store the file
    path = f"../frontend/images/{image.filename}"
    # open the path
    with open(path, "wb") as file:
        # write the image data to the file
        file.write(data)

    InsertImgPathIntoDB(image.filename, username)
    
    return {"images": image.filename, "username": username}

@app.get('/get-image/{username}')
def getImage(username: str):
    return getUserImg(username)
    
# endpoint for the websockets
@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    # wait for a websocket connection
    await manager.connect(websocket)
    try:
        # while websocket is active
        while True:
            # get message
            message = await websocket.receive_text()
            # send message to everyone
            await manager.broadcast(f"{username}: {message}")
    except WebSocketDisconnect:
        # remove the socket
        manager.disconnect(websocket)
        # send leave message to everyone
        await manager.broadcast(f"{username} has left the chat")

# if this is the file that was executed then run uvicorn
if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8080, reload=True)