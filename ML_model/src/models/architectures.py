"""
Model factory for creating optimized neural networks
"""
import tensorflow as tf
from tensorflow.keras.applications import ResNet50, VGG16, InceptionV3, EfficientNetB0, EfficientNetB3
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from src.core.config import Config

class ModelFactory:
    
    @staticmethod
    def create_resnet50(config: Config):
        """Create optimized ResNet50 model with transfer learning"""
        print("Creating ResNet50 model...")
        
        base_model = ResNet50(
            include_top=False, 
            input_shape=(*config.IMAGE_SIZE, 3), 
            weights='imagenet'
        )
        
        # Freeze base model layers
        for layer in base_model.layers:
            layer.trainable = False
        
        # Add custom head with dropout for regularization
        x = GlobalAveragePooling2D(name='global_avg_pool')(base_model.output)
        x = Dropout(0.2, name='dropout')(x)
        predictions = Dense(1, activation='sigmoid', name='predictions')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions, name='ResNet50_RailwayDefect')
        
        # Compile with optimized settings
        model.compile(
            optimizer=Adam(learning_rate=config.LEARNING_RATE),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        print(f"ResNet50 model created with {model.count_params():,} parameters")
        return model
    
    @staticmethod
    def create_vgg16(config: Config):
        """Create optimized VGG16 model with transfer learning"""
        print("Creating VGG16 model...")
        
        base_model = VGG16(
            include_top=False, 
            input_shape=(*config.IMAGE_SIZE, 3), 
            weights='imagenet'
        )
        
        # Freeze base model layers
        for layer in base_model.layers:
            layer.trainable = False
        
        # Add custom head
        x = GlobalAveragePooling2D(name='global_avg_pool')(base_model.output)
        x = Dropout(0.2, name='dropout')(x)
        predictions = Dense(1, activation='sigmoid', name='predictions')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions, name='VGG16_RailwayDefect')
        
        model.compile(
            optimizer=Adam(learning_rate=config.LEARNING_RATE),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        print(f"VGG16 model created with {model.count_params():,} parameters")
        return model
    
    @staticmethod
    def create_inception_v3(config: Config):
        """Create optimized InceptionV3 model with transfer learning"""
        print("Creating InceptionV3 model...")
        
        # InceptionV3 requires minimum 75x75 input
        input_size = (max(75, config.IMAGE_SIZE[0]), max(75, config.IMAGE_SIZE[1]), 3)
        
        base_model = InceptionV3(
            include_top=False, 
            input_shape=input_size, 
            weights='imagenet'
        )
        
        # Freeze base model layers
        for layer in base_model.layers:
            layer.trainable = False
        
        # Add custom head
        x = GlobalAveragePooling2D(name='global_avg_pool')(base_model.output)
        x = Dropout(0.2, name='dropout')(x)
        predictions = Dense(1, activation='sigmoid', name='predictions')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions, name='InceptionV3_RailwayDefect')
        
        model.compile(
            optimizer=Adam(learning_rate=config.LEARNING_RATE),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        print(f"InceptionV3 model created with {model.count_params():,} parameters")
        return model
    
    @staticmethod
    def create_efficientnet_b0(config: Config):
        """Create EfficientNet B0 model - Best balance of accuracy and speed"""
        print("Creating EfficientNet B0 model...")
        
        base_model = EfficientNetB0(
            include_top=False,
            input_shape=(*config.IMAGE_SIZE, 3),
            weights='imagenet'
        )
        
        # Freeze base model layers
        for layer in base_model.layers:
            layer.trainable = False
        
        # Add custom head with more dropout for regularization
        x = GlobalAveragePooling2D(name='global_avg_pool')(base_model.output)
        x = Dropout(0.3, name='dropout_1')(x)
        x = Dense(128, activation='relu', name='dense_1')(x)
        x = Dropout(0.2, name='dropout_2')(x)
        predictions = Dense(1, activation='sigmoid', name='predictions')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions, name='EfficientNetB0_RailwayDefect')
        
        # Compile with optimized settings
        model.compile(
            optimizer=Adam(learning_rate=config.LEARNING_RATE),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        print(f"EfficientNet B0 model created with {model.count_params():,} parameters")
        return model
    
    @staticmethod
    def create_efficientnet_b3(config: Config):
        """Create EfficientNet B3 model - Higher accuracy"""
        print("Creating EfficientNet B3 model...")
        
        base_model = EfficientNetB3(
            include_top=False,
            input_shape=(*config.IMAGE_SIZE, 3),
            weights='imagenet'
        )
        
        # Freeze base model layers
        for layer in base_model.layers:
            layer.trainable = False
        
        # Add custom head with more capacity
        x = GlobalAveragePooling2D(name='global_avg_pool')(base_model.output)
        x = Dropout(0.4, name='dropout_1')(x)
        x = Dense(256, activation='relu', name='dense_1')(x)
        x = Dropout(0.3, name='dropout_2')(x)
        x = Dense(128, activation='relu', name='dense_2')(x)
        x = Dropout(0.2, name='dropout_3')(x)
        predictions = Dense(1, activation='sigmoid', name='predictions')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions, name='EfficientNetB3_RailwayDefect')
        
        # Compile with optimized settings
        model.compile(
            optimizer=Adam(learning_rate=config.LEARNING_RATE),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        print(f"EfficientNet B3 model created with {model.count_params():,} parameters")
        return model
    
    @staticmethod
    def get_model(model_name: str, config: Config):
        """Factory method to get model by name"""
        models = {
            'resnet50': ModelFactory.create_resnet50,
            'vgg16': ModelFactory.create_vgg16,
            'inception_v3': ModelFactory.create_inception_v3,
            'efficientnet_b0': ModelFactory.create_efficientnet_b0,
            'efficientnet_b3': ModelFactory.create_efficientnet_b3
        }
        
        if model_name not in models:
            raise ValueError(f"Unknown model: {model_name}. Available: {list(models.keys())}")
        
        return models[model_name](config)