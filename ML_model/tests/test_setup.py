"""
Quick test script to verify ML pipeline setup
"""
import os
import sys
# Add the parent directory to Python path so we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_imports():
    """Test if all required packages can be imported"""
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow: {tf.__version__}")
        
        import numpy as np
        print(f"✅ NumPy: {np.__version__}")
        
        import matplotlib
        print(f"✅ Matplotlib: {matplotlib.__version__}")
        
        import sklearn
        print(f"✅ Scikit-learn: {sklearn.__version__}")
        
        import PIL
        print(f"✅ Pillow: {PIL.__version__}")
        
        # Test GPU availability
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"✅ GPU Available: {len(gpus)} GPU(s)")
            for i, gpu in enumerate(gpus):
                print(f"   GPU {i}: {gpu.name}")
        else:
            print("⚠️  No GPU detected - will use CPU")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    try:
        from src.core.config import Config
        config = Config()
        print(f"✅ Configuration loaded successfully")
        print(f"   Image size: {config.IMAGE_SIZE}")
        print(f"   Batch size: {config.BATCH_SIZE}")
        print(f"   Models to train: {config.MODELS_TO_TRAIN}")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_data_structure():
    """Test if data directory structure is correct"""
    from src.core.config import Config
    config = Config()
    
    required_dirs = [
        config.BASE_DATA_PATH,
        os.path.join(config.BASE_DATA_PATH, config.TRAIN_PATH),
        os.path.join(config.BASE_DATA_PATH, config.VAL_PATH),
        os.path.join(config.BASE_DATA_PATH, config.TEST_PATH)
    ]
    
    all_exist = True
    for directory in required_dirs:
        if os.path.exists(directory):
            print(f"✅ Directory exists: {directory}")
        else:
            print(f"❌ Directory missing: {directory}")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print("🚂 Railway Track Fault Detection - System Test")
    print("=" * 50)
    
    tests = [
        ("Package Imports", test_imports),
        ("Configuration", test_config),
        ("Data Structure", test_data_structure)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Testing {test_name}...")
        result = test_func()
        results.append(result)
        print(f"{'✅ PASSED' if result else '❌ FAILED'}")
    
    print(f"\n{'='*50}")
    if all(results):
        print("🎉 All tests passed! Ready to train models.")
        print("\nNext steps:")
        print("1. Ensure your data is in the correct directory structure")
        print("2. Run: python run_training.py")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\nCommon solutions:")
        print("1. Install missing packages: pip install -r requirements.txt")
        print("2. Create data directory structure as shown in README.md")

if __name__ == "__main__":
    main()