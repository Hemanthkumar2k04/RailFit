"""
Configuration file for Railway Track Fault Detection ML Model
"""
import os
from dataclasses import dataclass, field
from typing import Tuple, List

@dataclass
class Config:
    # Data paths
    BASE_DATA_PATH: str = os.getenv('DATA_PATH', './data/railway-track-fault-detection')
    TRAIN_PATH: str = 'Train'
    VAL_PATH: str = 'Validation'
    TEST_PATH: str = 'Test'
    
    # Model parameters - Optimized for CPU training
    IMAGE_SIZE: Tuple[int, int] = (224, 224)  # Optimal for EfficientNet
    BATCH_SIZE: int = 16  # Reduced for CPU training (memory efficient)
    EPOCHS: int = 25  # Balanced for good results
    
    # Classes
    CLASSES: List[str] = field(default_factory=lambda: ['Defective', 'Non defective'])
    
    # Output paths
    MODEL_OUTPUT_PATH: str = './models'
    RESULTS_PATH: str = './results'
    LOGS_PATH: str = './logs'
    
    # Model selection - EfficientNet for better performance with less data
    MODELS_TO_TRAIN: List[str] = field(default_factory=lambda: ['efficientnet_b0'])  # Best for limited data
    # Alternative: ['efficientnet_b0', 'efficientnet_b3'] for comparison
    
    # Training parameters - Optimized for EfficientNet
    LEARNING_RATE: float = 1e-4  # Lower learning rate for transfer learning
    EARLY_STOPPING_PATIENCE: int = 7  # More patience for better convergence
    REDUCE_LR_PATIENCE: int = 4  # Reduce LR when plateau is detected
    
    # Evaluation
    CONFIDENCE_THRESHOLD: float = 0.5