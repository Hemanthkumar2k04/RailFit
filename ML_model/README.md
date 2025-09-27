# Railway Track Fault Detection - ML Model

## 🚂 Optimized Machine Learning Pipeline

This directory contains an optimized machine learning pipeline for detecting defects in railway tracks using computer vision and deep learning.

## 📁 Project Structure

```
ML_model/
├── src/                   # Source code (organized)
│   ├── core/              # Core configuration and inference
│   │   ├── config.py      # Configuration settings
│   │   └── inference.py   # Model inference and prediction
│   ├── data/              # Data processing
│   │   └── pipeline.py    # Data pipeline and preprocessing
│   ├── models/            # Model architectures
│   │   └── architectures.py # Model architecture definitions
│   └── training/          # Training pipeline
│       └── trainer.py     # Training pipeline
├── scripts/               # Entry point scripts
│   └── train_model.py     # Main training script
├── tests/                 # Test scripts
│   └── test_setup.py      # Setup verification tests
├── run.py                 # Main entry point
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── data/                 # Data directory (create this)
├── models/               # Trained models (auto-created)
├── results/              # Training results (auto-created)
└── logs/                 # TensorBoard logs (auto-created)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to ML_model directory
cd ML_model

# Install required packages
pip install -r requirements.txt
```

### 2. Prepare Your Data

Organize your railway track images in this structure:

```
data/railway-track-fault-detection/
├── Train/
│   ├── Defective/          # Images of defective tracks
│   └── Non defective/      # Images of normal tracks
├── Validation/
│   ├── Defective/
│   └── Non defective/
└── Test/
    ├── Defective/
    └── Non defective/
```

### 3. Configure Training (Optional)

Edit `src/core/config.py` to customize:
- Image size (default: 224x224)
- Batch size (default: 32)
- Number of epochs (default: 20)
- Models to train (default: ResNet50)

### 4. Run Setup Tests

```bash
# Verify everything is set up correctly
python run.py test
```

### 5. Train the Model

```bash
# Run the training pipeline
python run.py train

# Or use the script directly
python scripts/train_model.py
```

### 6. Run Inference

```bash
# Test inference with trained model
python run.py inference --model-path models/resnet50_railway_defect.h5 --image path/to/test/image.jpg
```

## 📊 Monitoring Training

### TensorBoard (Real-time)
```bash
# In a separate terminal
tensorboard --logdir=logs
# Open http://localhost:6006 in browser
```

### Results
- Training plots: `results/`
- Model metrics: `results/*_results.json`
- Trained models: `models/`

## 🔧 Advanced Usage

### Train Multiple Models

Edit `config.py`:
```python
MODELS_TO_TRAIN = ['resnet50', 'vgg16', 'inception_v3']
```

### Custom Configuration

```python
from config import Config

# Create custom config
config = Config()
config.IMAGE_SIZE = (448, 448)  # Higher resolution
config.BATCH_SIZE = 16          # Smaller batches for GPU memory
config.EPOCHS = 30              # More training epochs
```

### Batch Inference

```python
from inference import RailwayDefectDetector

detector = RailwayDefectDetector('models/resnet50_best.h5')

# Process multiple images
image_paths = ['image1.jpg', 'image2.jpg', 'image3.jpg']
results = detector.predict_batch(image_paths)
```

## 🎯 Model Performance

Expected performance metrics:
- **Accuracy**: 85-95%
- **Precision**: 85-95%
- **Recall**: 85-95%
- **F1-Score**: 85-95%

## 🐛 Troubleshooting

### Common Issues

1. **CUDA/GPU Issues**
   ```bash
   # Check GPU availability
   python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
   ```

2. **Memory Issues**
   - Reduce batch size in `config.py`
   - Use smaller image size
   - Enable mixed precision training

3. **Data Loading Issues**
   - Verify data directory structure
   - Check image file formats (jpg, png, jpeg)
   - Ensure sufficient disk space

### Performance Optimization

1. **Enable Mixed Precision**
   ```python
   USE_MIXED_PRECISION = True  # In config.py
   ```

2. **Optimize Batch Size**
   ```python
   # Find optimal batch size for your GPU
   BATCH_SIZE = 64  # Increase if you have more GPU memory
   ```

3. **Use Data Prefetching**
   ```python
   PREFETCH_BUFFER_SIZE = tf.data.AUTOTUNE  # Already enabled
   ```

## 🔗 Integration with Backend

To integrate with your FastAPI backend:

```python
# In your FastAPI app
from ML_model.inference import RailwayDefectDetector

# Initialize detector
detector = RailwayDefectDetector('ML_model/models/resnet50_best.h5')

@app.post("/predict-defect")
async def predict_defect(file: UploadFile):
    contents = await file.read()
    result = detector.predict(contents)
    return result
```

## 📈 Next Steps

1. **Collect More Data**: Improve model accuracy with more diverse training data
2. **Data Augmentation**: Experiment with different augmentation techniques
3. **Model Ensemble**: Combine multiple models for better performance
4. **Deploy to Production**: Integrate with your Railway Management System
5. **Real-time Processing**: Optimize for live video feed analysis

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make improvements
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is part of the SIH Railway Management System.