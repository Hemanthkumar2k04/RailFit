import tensorflow as tf
from tensorflow.keras import RMSprop
model.compile(optimizer=RMSprop(), loss='categorical_crossentropy', metrics=['accuracy'])

# Load the model
print("🔄 Loading model...")
model = tf.keras.models.load_model("rail_defect_model.keras")
print("✅ Model loaded successfully!")

# Check the model summary
model.summary()

# Quick prediction test with random data
import numpy as np
dummy_input = np.random.rand(1, 224, 224, 3)  # random image
pred = model.predict(dummy_input)
print("Sample prediction:", pred)
