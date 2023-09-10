import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.text import tokenizer_from_json
from tensorflow.keras.preprocessing.sequence import pad_sequences
import asyncio
from websockets.server import serve
import json

max_length = 200
trunc_type = 'post'
vocab_size = 100000  # Maximum number of words in your vocabulary
embedding_dim = 16

# Load tokenizer 
tokenizer = tokenizer_from_json(open("tokenizer.json").read())

model = keras.Sequential([
    keras.layers.Embedding(vocab_size, embedding_dim, input_length=max_length),
    keras.layers.Dropout(0.2),
    keras.layers.GlobalAveragePooling1D(),

    keras.layers.Dense(1024, activation='relu'),
    keras.layers.Dense(1024, activation='relu'),

    keras.layers.Dense(8, activation='sigmoid'),

    keras.layers.Dense(1, activation='sigmoid')  # Output layer for binary classification
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

model.load_weights('./model.h5')

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