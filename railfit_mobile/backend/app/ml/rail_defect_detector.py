import tensorflow as tf
import numpy as np
from PIL import Image
import io
import logging
from typing import Dict, Any, Optional
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RailDefectDetector:
    """
    AI-powered rail defect detection using your trained MobileNetV2 model
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the defect detector with your trained model
        
        Args:
            model_path: Path to your saved model (.h5 or SavedModel format)
        """
        self.model = None
        self.model_loaded = False
        self.input_size = (224, 224)
        
        # Try to load the model if path is provided
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            logger.warning(f"Model path not found: {model_path}. Using simulation mode.")
    
    def load_model(self, model_path: str) -> bool:
        """
        Load the trained MobileNetV2 model
        
        Args:
            model_path: Path to the saved model
            
        Returns:
            bool: True if model loaded successfully
        """
        try:
            logger.info(f"Loading model from: {model_path}")
            
            # Load your trained model
            if model_path.endswith('.h5'):
                self.model = tf.keras.models.load_model(model_path)
            else:
                self.model = tf.keras.models.load_model(model_path)
            
            # Verify model input shape
            expected_shape = (None, 224, 224, 3)
            actual_shape = self.model.input_shape
            
            if actual_shape != expected_shape:
                logger.warning(f"Model input shape {actual_shape} doesn't match expected {expected_shape}")
            
            self.model_loaded = True
            logger.info("Model loaded successfully!")
            
            # Print model summary for verification
            logger.info("Model architecture:")
            self.model.summary()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            self.model_loaded = False
            return False
    
    def preprocess_image(self, image_data: bytes) -> np.ndarray:
        """
        Preprocess image for model input
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Preprocessed image array ready for model inference
        """
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to model input size
            image = image.resize(self.input_size)
            
            # Convert to numpy array and normalize (0-1 range)
            img_array = np.array(image, dtype=np.float32) / 255.0
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            logger.error(f"Failed to preprocess image: {str(e)}")
            raise ValueError(f"Image preprocessing failed: {str(e)}")
    
    def predict_defect(self, image_data: bytes) -> Dict[str, Any]:
        """
        Predict if rail component is defective
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image_data)
            
            if self.model_loaded and self.model is not None:
                # Run actual model inference
                prediction = self.model.predict(processed_image, verbose=0)
                
                # Extract prediction probability (assuming binary classification)
                # Your model outputs sigmoid, so values > 0.5 indicate defective
                confidence = float(prediction[0][0])
                is_defective = confidence > 0.5
                
                result = {
                    "prediction": "Defective" if is_defective else "Non-Defective",
                    "confidence": confidence,
                    "defect_probability": confidence if is_defective else 1 - confidence,
                    "model_version": "MobileNetV2_RailFIT_v1.0",
                    "processing_time_ms": 0  # You can add timing if needed
                }
                
            else:
                # Simulation mode when model isn't loaded
                logger.info("Running in simulation mode - model not loaded")
                import random
                
                confidence = random.uniform(0.65, 0.95)  # Simulate high confidence
                is_defective = random.choice([True, False])
                
                result = {
                    "prediction": "Defective" if is_defective else "Non-Defective",
                    "confidence": confidence,
                    "defect_probability": confidence if is_defective else 1 - confidence,
                    "model_version": "Simulation_Mode",
                    "processing_time_ms": random.randint(800, 1200)
                }
            
            logger.info(f"Prediction: {result['prediction']} (confidence: {result['confidence']:.2f})")
            return result
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return {
                "prediction": "Error",
                "confidence": 0.0,
                "defect_probability": 0.0,
                "error": str(e),
                "model_version": "Error"
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model
        
        Returns:
            Dictionary containing model information
        """
        if self.model_loaded and self.model is not None:
            return {
                "model_loaded": True,
                "model_type": "MobileNetV2",
                "input_shape": self.model.input_shape,
                "output_shape": self.model.output_shape,
                "trainable_params": self.model.count_params(),
                "model_size_mb": self.model.count_params() * 4 / (1024 * 1024)  # Approximate size
            }
        else:
            return {
                "model_loaded": False,
                "mode": "simulation",
                "message": "Model not loaded - using simulation mode"
            }
    
    def batch_predict(self, image_list: list) -> list:
        """
        Process multiple images at once for better efficiency
        
        Args:
            image_list: List of image byte arrays
            
        Returns:
            List of prediction dictionaries
        """
        results = []
        
        if self.model_loaded and self.model is not None:
            try:
                # Preprocess all images
                processed_images = []
                for image_data in image_list:
                    processed_img = self.preprocess_image(image_data)
                    processed_images.append(processed_img[0])  # Remove batch dimension
                
                # Stack into batch
                batch_images = np.stack(processed_images, axis=0)
                
                # Run batch prediction
                batch_predictions = self.model.predict(batch_images, verbose=0)
                
                # Process results
                for i, prediction in enumerate(batch_predictions):
                    confidence = float(prediction[0])
                    is_defective = confidence > 0.5
                    
                    results.append({
                        "prediction": "Defective" if is_defective else "Non-Defective",
                        "confidence": confidence,
                        "defect_probability": confidence if is_defective else 1 - confidence,
                        "model_version": "MobileNetV2_RailFIT_v1.0",
                        "batch_index": i
                    })
                    
            except Exception as e:
                logger.error(f"Batch prediction failed: {str(e)}")
                # Fall back to individual predictions
                for image_data in image_list:
                    results.append(self.predict_defect(image_data))
        else:
            # Simulation mode for batch processing
            for i, image_data in enumerate(image_list):
                result = self.predict_defect(image_data)
                result["batch_index"] = i
                results.append(result)
        
        return results

# Global model instance - initialize once when server starts
detector = None

def initialize_detector(model_path: str = None) -> RailDefectDetector:
    """
    Initialize the global detector instance
    
    Args:
        model_path: Path to your trained model
        
    Returns:
        RailDefectDetector instance
    """
    global detector
    if detector is None:
        # Try different common model paths
        possible_paths = [
            model_path,
            '/app/models/railfit_model.h5',
            './models/railfit_model.h5',
            '/models/railfit_mobilenetv2.h5',
            os.environ.get('MODEL_PATH')
        ]
        
        model_path_to_use = None
        for path in possible_paths:
            if path and os.path.exists(path):
                model_path_to_use = path
                break
        
        detector = RailDefectDetector(model_path_to_use)
        logger.info(f"Detector initialized. Model loaded: {detector.model_loaded}")
    
    return detector

def get_detector() -> RailDefectDetector:
    """
    Get the global detector instance
    
    Returns:
        RailDefectDetector instance
    """
    global detector
    if detector is None:
        detector = initialize_detector()
    return detector

# Example usage and testing
if __name__ == "__main__":
    # Initialize detector
    detector = initialize_detector()
    
    # Print model info
    info = detector.get_model_info()
    print("Model Info:", info)
    
    # Test with a dummy image (you can replace with actual image path)
    try:
        # Create a dummy image for testing
        from PIL import Image
        dummy_image = Image.new('RGB', (224, 224), color='red')
        img_bytes = io.BytesIO()
        dummy_image.save(img_bytes, format='JPEG')
        img_bytes = img_bytes.getvalue()
        
        # Test prediction
        result = detector.predict_defect(img_bytes)
        print("Test Prediction:", result)
        
    except Exception as e:
        print(f"Test failed: {e}")