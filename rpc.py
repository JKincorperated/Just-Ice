import tensorflow as tf
from tensorflow.keras.preprocessing.text import tokenizer_from_json
from tensorflow.keras.preprocessing.sequence import pad_sequences
import asyncio
from websockets.server import serve
import json

max_length = 200
trunc_type = 'post'

# Load tokenizer 
tokenizer = tokenizer_from_json(open("tokenizer.json").read())
model = tf.keras.models.load_model('model.keras')

async def process(websocket):
    async for message in websocket:
        test_input_data = json.loads(message)
        test_sequences = tokenizer.texts_to_sequences(test_input_data)
        test_padded_sequences = pad_sequences(test_sequences, maxlen=max_length, truncating=trunc_type)
        predictions = model.predict(test_padded_sequences, verbose=0)
        await websocket.send(json.dumps(predictions.tolist()))

async def main():
    async with serve(process, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())