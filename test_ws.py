import asyncio
import websockets
import json

async def test():
    uri = "ws://127.0.0.1:60310/"
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps({"role": "user", "start": True}))
            await websocket.send(json.dumps({"role": "user", "type": "message", "content": "hi"}))
            await websocket.send(json.dumps({"role": "user", "end": True}))
            
            while True:
                response = await websocket.recv()
                print("Received:", response)
                data = json.loads(response)
                if data.get("type") == "status" and data.get("content") == "complete":
                    break
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
