"""
Test the trained ResNet50 model for Railway Track Fault Detection
"""
import os
import numpy as np
import tensorflow as tf
from PIL import Image
import matplotlib.pyplot as plt
import json
from src.core.config import Config
from src.core.inference import RailwayDefectDetector

def test_model_on_test_set():
    """Test the model on the test dataset"""
    print("🧪 Testing ResNet50 Model on Test Dataset")
    print("=" * 50)
    
    config = Config()
    model_path = os.path.join(config.MODEL_OUTPUT_PATH, 'resnet50_best.h5')
    
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        print("Please train the model first using: python run.py train")
        return
    
    # Initialize detector
    detector = RailwayDefectDetector(model_path, config)
    
    # Test on individual images from test set
    test_defective_dir = os.path.join(config.BASE_DATA_PATH, config.TEST_PATH, 'Defective')
    test_normal_dir = os.path.join(config.BASE_DATA_PATH, config.TEST_PATH, 'Non defective')
    
    print(f"📂 Testing on images from: {config.BASE_DATA_PATH}/{config.TEST_PATH}")
    
    # Test defective images
    if os.path.exists(test_defective_dir):
        defective_images = [f for f in os.listdir(test_defective_dir) 
                          if f.lower().endswith(('.png', '.jpg', '.jpeg'))][:5]  # Test first 5
        
        print(f"\n🔴 Testing {len(defective_images)} DEFECTIVE images:")
        correct_defective = 0
        
        for img_file in defective_images:
            img_path = os.path.join(test_defective_dir, img_file)
            result = detector.predict_single_image(img_path)
            
            predicted_class = result['predicted_class']
            confidence = result['confidence']
            is_correct = predicted_class == 'Defective'
            
            status = "✅" if is_correct else "❌"
            print(f"  {status} {img_file[:30]:<30} → {predicted_class} ({confidence:.2%})")
            
            if is_correct:
                correct_defective += 1
        
        defective_accuracy = correct_defective / len(defective_images) * 100
        print(f"  📊 Defective Detection Accuracy: {defective_accuracy:.1f}% ({correct_defective}/{len(defective_images)})")
    
    # Test normal images
    if os.path.exists(test_normal_dir):
        normal_images = [f for f in os.listdir(test_normal_dir) 
                        if f.lower().endswith(('.png', '.jpg', '.jpeg'))][:5]  # Test first 5
        
        print(f"\n🟢 Testing {len(normal_images)} NORMAL images:")
        correct_normal = 0
        
        for img_file in normal_images:
            img_path = os.path.join(test_normal_dir, img_file)
            result = detector.predict_single_image(img_path)
            
            predicted_class = result['predicted_class']
            confidence = result['confidence']
            is_correct = predicted_class == 'Non defective'
            
            status = "✅" if is_correct else "❌"
            print(f"  {status} {img_file[:30]:<30} → {predicted_class} ({confidence:.2%})")
            
            if is_correct:
                correct_normal += 1
        
        normal_accuracy = correct_normal / len(normal_images) * 100
        print(f"  📊 Normal Detection Accuracy: {normal_accuracy:.1f}% ({correct_normal}/{len(normal_images)})")

def test_model_interactive():
    """Interactive testing - specify image path"""
    print("\\n🎯 Interactive Model Testing")
    print("=" * 50)
    
    config = Config()
    model_path = os.path.join(config.MODEL_OUTPUT_PATH, 'resnet50_best.h5')
    
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        return
    
    detector = RailwayDefectDetector(model_path, config)
    
    print("Enter the path to an image file to test:")
    print("Example: data/railway-track-fault-detection/Test/Defective/image.jpg")
    print("Or press Enter to skip interactive testing")
    
    image_path = input("Image path: ").strip()
    
    if image_path and os.path.exists(image_path):
        print(f"\\n🔍 Testing image: {image_path}")
        result = detector.predict_single_image(image_path)
        
        print(f"\\n📊 Results:")
        print(f"  Predicted Class: {result['predicted_class']}")
        print(f"  Confidence: {result['confidence']:.2%}")
        print(f"  Raw Prediction: {result['prediction']:.4f}")
        print(f"  Threshold: {result['threshold']}")
        
        # Display image info
        try:
            with Image.open(image_path) as img:
                print(f"\\n🖼️  Image Info:")
                print(f"  Size: {img.size}")
                print(f"  Mode: {img.mode}")
        except Exception as e:
            print(f"Could not read image info: {e}")
    
    elif image_path:
        print(f"❌ Image not found: {image_path}")

def show_training_summary():
    """Show training results summary"""
    print("\\n📈 Training Summary")
    print("=" * 50)
    
    # Load training summary
    summary_path = "results/training_summary.json"
    detailed_path = "results/resnet50_results.json"
    
    if os.path.exists(summary_path):
        with open(summary_path, 'r') as f:
            summary = json.load(f)
        
        print("Overall Results:")
        for model, results in summary.items():
            print(f"  {model.upper()}:")
            print(f"    Accuracy: {results['accuracy']:.2%}")
            print(f"    AUC Score: {results['auc_score']:.3f}")
    
    if os.path.exists(detailed_path):
        with open(detailed_path, 'r') as f:
            detailed = json.load(f)
        
        print("\\nDetailed Classification Report:")
        cr = detailed['classification_report']
        
        print(f"  Defective Detection:")
        print(f"    Precision: {cr['Defective']['precision']:.2%}")
        print(f"    Recall: {cr['Defective']['recall']:.2%}")
        print(f"    F1-Score: {cr['Defective']['f1-score']:.3f}")
        
        print(f"  Normal Track Detection:")
        print(f"    Precision: {cr['Non-Defective']['precision']:.2%}")
        print(f"    Recall: {cr['Non-Defective']['recall']:.2%}")
        print(f"    F1-Score: {cr['Non-Defective']['f1-score']:.3f}")

def main():
    """Main testing function"""
    print("🚂 Railway Track Fault Detection - Model Testing")
    print("=" * 60)
    
    # Show training summary
    show_training_summary()
    
    # Test on test dataset
    test_model_on_test_set()
    
    # Interactive testing
    test_model_interactive()
    
    print("\\n🎉 Model testing completed!")
    print("\\nTip: You can also use the inference directly:")
    print("python run.py inference --model-path models/resnet50_best.h5 --image path/to/image.jpg")

if __name__ == "__main__":
    main()