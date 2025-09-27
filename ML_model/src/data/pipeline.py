"""
Optimized data pipeline for Railway Track Fault Detection
"""
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
from tensorflow.keras.applications.vgg16 import preprocess_input as vgg_preprocess
from tensorflow.keras.applications.inception_v3 import preprocess_input as inception_preprocess
from src.core.config import Config

class DataPipeline:
    def __init__(self, config: Config):
        self.config = config
        
        # Preprocessing functions for different models
        self.preprocess_functions = {
            'resnet50': resnet_preprocess,
            'vgg16': vgg_preprocess,
            'inception_v3': inception_preprocess
        }
    
    def create_data_generators(self, model_name: str = 'resnet50'):
        """Create optimized data generators with model-specific preprocessing"""
        
        preprocess_fn = self.preprocess_functions.get(model_name, resnet_preprocess)
        
        # Training data generator with augmentation
        train_datagen = ImageDataGenerator(
            rotation_range=15,
            zoom_range=0.1,
            brightness_range=[0.8, 1.2],
            width_shift_range=0.1,
            height_shift_range=0.1,
            horizontal_flip=True,
            fill_mode='nearest',
            preprocessing_function=preprocess_fn
        )
        
        # Validation data generator (no augmentation)
        val_datagen = ImageDataGenerator(
            preprocessing_function=preprocess_fn
        )
        
        # Test data generator
        test_datagen = ImageDataGenerator(
            preprocessing_function=preprocess_fn
        )
        
        # Create generators with error handling
        try:
            train_generator = train_datagen.flow_from_directory(
                os.path.join(self.config.BASE_DATA_PATH, self.config.TRAIN_PATH),
                target_size=self.config.IMAGE_SIZE,
                batch_size=self.config.BATCH_SIZE,
                class_mode='binary',
                shuffle=True,
                seed=42
            )
            
            val_generator = val_datagen.flow_from_directory(
                os.path.join(self.config.BASE_DATA_PATH, self.config.VAL_PATH),
                target_size=self.config.IMAGE_SIZE,
                batch_size=self.config.BATCH_SIZE,
                class_mode='binary',
                shuffle=False,
                seed=42
            )
            
            test_generator = test_datagen.flow_from_directory(
                os.path.join(self.config.BASE_DATA_PATH, self.config.TEST_PATH),
                target_size=self.config.IMAGE_SIZE,
                batch_size=self.config.BATCH_SIZE,
                class_mode='binary',
                shuffle=False,
                seed=42
            )
            
            print(f"Data generators created successfully:")
            print(f"  Training samples: {train_generator.samples}")
            print(f"  Validation samples: {val_generator.samples}")
            print(f"  Test samples: {test_generator.samples}")
            print(f"  Class indices: {train_generator.class_indices}")
            
            return train_generator, val_generator, test_generator
            
        except Exception as e:
            print(f"Error creating data generators: {e}")
            print(f"Make sure data directory exists: {self.config.BASE_DATA_PATH}")
            raise
    
    def get_dataset_info(self):
        """Get information about the dataset"""
        info = {}
        for split in ['Train', 'Validation', 'Test']:
            split_path = os.path.join(self.config.BASE_DATA_PATH, split)
            if os.path.exists(split_path):
                classes = {}
                for class_name in os.listdir(split_path):
                    class_path = os.path.join(split_path, class_name)
                    if os.path.isdir(class_path):
                        classes[class_name] = len([f for f in os.listdir(class_path) 
                                                 if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
                info[split] = classes
            else:
                info[split] = "Directory not found"
        
        return info