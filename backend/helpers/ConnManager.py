# this file will manage the connections of the websockets
# this was takken from the fastAPI docs

from fastapi import WebSocket

class ConnectionManager:
    
    def __init__(self) -> None:
        # init a list of empty websockets
        self.active_connection: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connection.append(websocket)
    
    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connection.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket) -> None:
        await websocket.send_text(message)

    async def broadcast(self, message: str) -> None:
        for connection in self.active_connection:
            await connection.send_text(message)