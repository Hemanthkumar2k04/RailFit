"""
Main training script for Railway Track Fault Detection
Run this script to train the model(s)
"""
import sys
import os
# Add the parent directory to Python path so we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.config import Config
from src.training.trainer import Trainer
from src.data.pipeline import DataPipeline

def main():
    """Main function to run the training pipeline"""
    print("🚂 Railway Track Fault Detection - ML Training Pipeline")
    print("=" * 60)
    
    # Initialize configuration
    config = Config()
    
    # Display configuration
    print(f"Configuration:")
    print(f"  Data path: {config.BASE_DATA_PATH}")
    print(f"  Image size: {config.IMAGE_SIZE}")
    print(f"  Batch size: {config.BATCH_SIZE}")
    print(f"  Epochs: {config.EPOCHS}")
    print(f"  Models to train: {config.MODELS_TO_TRAIN}")
    
    # Check if data exists
    data_pipeline = DataPipeline(config)
    dataset_info = data_pipeline.get_dataset_info()
    
    print(f"\nDataset Information:")
    for split, classes in dataset_info.items():
        if isinstance(classes, dict):
            total_images = sum(classes.values())
            print(f"  {split}: {total_images} images")
            for class_name, count in classes.items():
                print(f"    {class_name}: {count}")
        else:
            print(f"  {split}: {classes}")
    
    # Check if all required directories exist
    required_dirs = [
        os.path.join(config.BASE_DATA_PATH, config.TRAIN_PATH),
        os.path.join(config.BASE_DATA_PATH, config.VAL_PATH),
        os.path.join(config.BASE_DATA_PATH, config.TEST_PATH)
    ]
    
    missing_dirs = [d for d in required_dirs if not os.path.exists(d)]
    if missing_dirs:
        print(f"\n❌ Error: Missing required directories:")
        for d in missing_dirs:
            print(f"  {d}")
        print(f"\nPlease ensure your data is organized as:")
        print(f"  {config.BASE_DATA_PATH}/")
        print(f"    ├── Train/")
        print(f"    │   ├── Defective/")
        print(f"    │   └── Non defective/")
        print(f"    ├── Validation/")
        print(f"    │   ├── Defective/")
        print(f"    │   └── Non defective/")
        print(f"    └── Test/")
        print(f"        ├── Defective/")
        print(f"        └── Non defective/")
        return
    
    # Initialize trainer
    trainer = Trainer(config)
    
    # Start training
    print(f"\n🚀 Starting model training...")
    results = trainer.train_all_models()
    
    print(f"\n✅ Training completed!")
    print(f"📊 Check results in: {config.RESULTS_PATH}")
    print(f"💾 Models saved in: {config.MODEL_OUTPUT_PATH}")
    print(f"📈 TensorBoard logs: {config.LOGS_PATH}")
    
    return results

if __name__ == "__main__":
    try:
        results = main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
    except Exception as e:
        print(f"\n❌ Training failed with error: {e}")
        import traceback
        traceback.print_exc()