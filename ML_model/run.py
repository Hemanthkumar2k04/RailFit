#!/usr/bin/env python3
"""
Main entry point for Railway Track Fault Detection ML Pipeline
"""
import sys
import os
import argparse

# Add src to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def main():
    parser = argparse.ArgumentParser(description='Railway Track Fault Detection ML Pipeline')
    parser.add_argument('command', choices=['train', 'test', 'inference', 'test-model'], 
                       help='Command to run')
    parser.add_argument('--model', choices=['resnet50', 'vgg16', 'inception_v3'], 
                       help='Model to use (for inference)')
    parser.add_argument('--image', type=str, help='Image path (for inference)')
    parser.add_argument('--model-path', type=str, help='Path to trained model (for inference)')
    
    args = parser.parse_args()
    
    if args.command == 'train':
        print("Starting training pipeline...")
        from scripts.train_model import main as train_main
        train_main()
        
    elif args.command == 'test':
        print("Running setup tests...")
        from tests.test_setup import main as test_main
        test_main()
        
    elif args.command == 'test-model':
        print("Testing trained model...")
        from test_model import main as test_model_main
        test_model_main()
        
    elif args.command == 'inference':
        if not args.model_path or not args.image:
            print("Error: --model-path and --image are required for inference")
            sys.exit(1)
            
        print("Running inference...")
        from src.core.inference import RailwayDefectDetector
        from src.core.config import Config
        
        config = Config()
        detector = RailwayDefectDetector(args.model_path, config)
        result = detector.predict_single_image(args.image)
        
        print(f"Prediction: {result}")

if __name__ == "__main__":
    main()