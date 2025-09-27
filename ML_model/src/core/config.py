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
    IMAGE_SIZE: Tuple[int, int] = (224, 224)  # Standard input size for transfer learning
    BATCH_SIZE: int = 16  # Reduced for CPU training (memory efficient)
    EPOCHS: int = 25  # Balanced for good results
    
    # Classes
    CLASSES: List[str] = field(default_factory=lambda: ['Defective', 'Non defective'])
    
    # Output paths
    MODEL_OUTPUT_PATH: str = './models'
    RESULTS_PATH: str = './results'
    LOGS_PATH: str = './logs'
    
    # Model selection - Focus on proven architectures
    MODELS_TO_TRAIN: List[str] = field(default_factory=lambda: ['resnet50'])  # Stable and reliable
    # Available options: ['resnet50', 'vgg16', 'inception_v3']
    
    # Training parameters - Optimized for transfer learning
    LEARNING_RATE: float = 1e-4  # Lower learning rate for transfer learning
    EARLY_STOPPING_PATIENCE: int = 7  # More patience for better convergence
    REDUCE_LR_PATIENCE: int = 4  # Reduce LR when plateau is detected
    
    # Evaluation
    CONFIDENCE_THRESHOLD: float = 0.5