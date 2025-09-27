"""
Inference script for Railway Track Fault Detection
"""
import os
import numpy as np
import tensorflow as tf
from PIL import Image
import io
from typing import Dict, Union
from src.core.config import Config

class RailwayDefectDetector:
    def __init__(self, model_path: str, config: Config = None):
        """
        Initialize the detector with a trained model
        
        Args:
            model_path: Path to the trained model (.h5 or SavedModel)
            config: Configuration object (optional)
        """
        self.config = config or Config()
        self.model = tf.keras.models.load_model(model_path)
        self.input_size = self.config.IMAGE_SIZE
        
        print(f"Model loaded successfully from: {model_path}")
        print(f"Input size: {self.input_size}")
        print(f"Model architecture: {self.model.name}")
    
    def preprocess_image(self, image_input: Union[str, bytes, np.ndarray]) -> np.ndarray:
        """
        Preprocess image for model inference
        
        Args:
            image_input: Can be file path, bytes, or numpy array
            
        Returns:
            Preprocessed image array ready for prediction
        """
        try:
            # Handle different input types
            if isinstance(image_input, str):
                # File path
                image = Image.open(image_input)
            elif isinstance(image_input, bytes):
                # Bytes (from API)
                image = Image.open(io.BytesIO(image_input))
            elif isinstance(image_input, np.ndarray):
                # Numpy array
                image = Image.fromarray(image_input.astype('uint8'))
            else:
                raise ValueError(f"Unsupported image input type: {type(image_input)}")
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize image
            image = image.resize(self.input_size)
            
            # Convert to numpy array and normalize
            image_array = np.array(image)
            
            # Apply model-specific preprocessing
            if 'resnet' in self.model.name.lower():
                from tensorflow.keras.applications.resnet50 import preprocess_input
                image_array = preprocess_input(image_array)
            elif 'vgg' in self.model.name.lower():
                from tensorflow.keras.applications.vgg16 import preprocess_input
                image_array = preprocess_input(image_array)
            elif 'inception' in self.model.name.lower():
                from tensorflow.keras.applications.inception_v3 import preprocess_input
                image_array = preprocess_input(image_array)
            else:
                # Default normalization
                image_array = image_array / 255.0
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            return image_array
            
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {str(e)}")
    
    def predict(self, image_input: Union[str, bytes, np.ndarray]) -> Dict:
        """
        Predict if railway track is defective
        
        Args:
            image_input: Image to analyze
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_input)
            
            # Make prediction
            prediction = self.model.predict(processed_image, verbose=0)[0][0]
            
            # Determine if defective
            is_defective = prediction > self.config.CONFIDENCE_THRESHOLD
            confidence = float(prediction) if is_defective else float(1 - prediction)
            
            # Create result dictionary
            result = {
                "is_defective": bool(is_defective),
                "confidence": round(confidence, 4),
                "prediction_score": round(float(prediction), 4),
                "threshold": self.config.CONFIDENCE_THRESHOLD,
                "model_name": self.model.name,
                "status": "success"
            }
            
            return result
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "is_defective": None,
                "confidence": None
            }
    
    def predict_batch(self, image_paths: list) -> list:
        """
        Predict multiple images at once
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            List of prediction results
        """
        results = []
        
        print(f"Processing {len(image_paths)} images...")
        
        for i, image_path in enumerate(image_paths):
            try:
                result = self.predict(image_path)
                result['image_path'] = image_path
                results.append(result)
                
                if (i + 1) % 10 == 0:
                    print(f"Processed {i + 1}/{len(image_paths)} images")
                    
            except Exception as e:
                results.append({
                    "image_path": image_path,
                    "status": "error",
                    "error": str(e)
                })
        
        return results

def test_model_inference():
    """Test function to verify model inference works correctly"""
    config = Config()
    
    # Check if model exists
    model_path = os.path.join(config.MODEL_OUTPUT_PATH, 'resnet50_best.h5')
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}")
        print("Please train the model first using train.py")
        return
    
    # Initialize detector
    detector = RailwayDefectDetector(model_path, config)
    
    # Test with a sample image (if exists)
    test_images_dir = os.path.join(config.BASE_DATA_PATH, config.TEST_PATH)
    
    if os.path.exists(test_images_dir):
        # Find first image in test directory
        for class_dir in os.listdir(test_images_dir):
            class_path = os.path.join(test_images_dir, class_dir)
            if os.path.isdir(class_path):
                images = [f for f in os.listdir(class_path) 
                         if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                if images:
                    test_image_path = os.path.join(class_path, images[0])
                    
                    print(f"\nTesting with image: {test_image_path}")
                    result = detector.predict(test_image_path)
                    
                    print(f"Results:")
                    for key, value in result.items():
                        print(f"  {key}: {value}")
                    
                    return result
    
    print("No test images found. Please ensure test data is available.")
    return None

if __name__ == "__main__":
    test_model_inference()