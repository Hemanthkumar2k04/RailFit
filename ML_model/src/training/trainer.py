"""
Training pipeline for Railway Track Fault Detection
"""
import os
import json
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard

from src.core.config import Config
from src.models.architectures import ModelFactory
from src.data.pipeline import DataPipeline

class Trainer:
    def __init__(self, config: Config):
        self.config = config
        self.data_pipeline = DataPipeline(config)
        
        # Create output directories
        os.makedirs(config.MODEL_OUTPUT_PATH, exist_ok=True)
        os.makedirs(config.RESULTS_PATH, exist_ok=True)
        os.makedirs(config.LOGS_PATH, exist_ok=True)
    
    def get_callbacks(self, model_name: str):
        """Get training callbacks for optimization"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=self.config.EARLY_STOPPING_PATIENCE,
                restore_best_weights=True,
                verbose=1,
                mode='min'
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=self.config.REDUCE_LR_PATIENCE,
                min_lr=1e-7,
                verbose=1,
                mode='min'
            ),
            ModelCheckpoint(
                filepath=os.path.join(self.config.MODEL_OUTPUT_PATH, f'{model_name}_best.h5'),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1,
                mode='max'
            ),
            TensorBoard(
                log_dir=os.path.join(self.config.LOGS_PATH, f'{model_name}_{timestamp}'),
                histogram_freq=1,
                write_graph=True,
                update_freq='epoch'
            )
        ]
        return callbacks
    
    def evaluate_model(self, model, test_generator):
        """Comprehensive model evaluation"""
        print("Evaluating model...")
        
        # Reset generator
        test_generator.reset()
        
        # Get predictions
        predictions = model.predict(test_generator, verbose=1)
        y_pred_binary = (predictions > self.config.CONFIDENCE_THRESHOLD).astype(int)
        y_true = test_generator.classes
        
        # Calculate metrics
        accuracy = np.mean(y_pred_binary.flatten() == y_true)
        auc_score = roc_auc_score(y_true, predictions)
        
        # Classification report
        class_names = ['Non-Defective', 'Defective']
        report = classification_report(
            y_true, 
            y_pred_binary.flatten(), 
            target_names=class_names,
            output_dict=True
        )
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred_binary.flatten())
        
        results = {
            'accuracy': float(accuracy),
            'auc_score': float(auc_score),
            'classification_report': report,
            'confusion_matrix': cm.tolist(),
            'predictions': predictions.flatten().tolist(),
            'true_labels': y_true.tolist()
        }
        
        # Print results
        print(f"\nModel Evaluation Results:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"AUC Score: {auc_score:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(y_true, y_pred_binary.flatten(), target_names=class_names))
        print(f"\nConfusion Matrix:")
        print(cm)
        
        return results
    
    def plot_training_history(self, history, model_name: str):
        """Plot and save training history"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Accuracy
        axes[0, 0].plot(history.history['accuracy'], label='Training Accuracy')
        axes[0, 0].plot(history.history['val_accuracy'], label='Validation Accuracy')
        axes[0, 0].set_title('Model Accuracy')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].legend()
        axes[0, 0].grid(True)
        
        # Loss
        axes[0, 1].plot(history.history['loss'], label='Training Loss')
        axes[0, 1].plot(history.history['val_loss'], label='Validation Loss')
        axes[0, 1].set_title('Model Loss')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Loss')
        axes[0, 1].legend()
        axes[0, 1].grid(True)
        
        # Precision
        if 'precision' in history.history:
            axes[1, 0].plot(history.history['precision'], label='Training Precision')
            axes[1, 0].plot(history.history['val_precision'], label='Validation Precision')
            axes[1, 0].set_title('Model Precision')
            axes[1, 0].set_xlabel('Epoch')
            axes[1, 0].set_ylabel('Precision')
            axes[1, 0].legend()
            axes[1, 0].grid(True)
        
        # Recall
        if 'recall' in history.history:
            axes[1, 1].plot(history.history['recall'], label='Training Recall')
            axes[1, 1].plot(history.history['val_recall'], label='Validation Recall')
            axes[1, 1].set_title('Model Recall')
            axes[1, 1].set_xlabel('Epoch')
            axes[1, 1].set_ylabel('Recall')
            axes[1, 1].legend()
            axes[1, 1].grid(True)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.config.RESULTS_PATH, f'{model_name}_training_history.png'), 
                   dpi=300, bbox_inches='tight')
        plt.show()
    
    def train_model(self, model_name: str):
        """Train a single model"""
        print(f"\n{'='*50}")
        print(f"Training {model_name.upper()} model")
        print(f"{'='*50}")
        
        try:
            # Create data generators
            train_gen, val_gen, test_gen = self.data_pipeline.create_data_generators(model_name)
            
            # Create model
            model = ModelFactory.get_model(model_name, self.config)
            
            # Get callbacks
            callbacks = self.get_callbacks(model_name)
            
            # Train model
            print(f"\nStarting training...")
            history = model.fit(
                train_gen,
                epochs=self.config.EPOCHS,
                validation_data=val_gen,
                callbacks=callbacks,
                verbose=1
            )
            
            # Plot training history
            self.plot_training_history(history, model_name)
            
            # Load best model
            best_model_path = os.path.join(self.config.MODEL_OUTPUT_PATH, f'{model_name}_best.h5')
            if os.path.exists(best_model_path):
                model = tf.keras.models.load_model(best_model_path)
                print(f"Loaded best model from {best_model_path}")
            
            # Evaluate model
            results = self.evaluate_model(model, test_gen)
            
            # Save results
            results_file = os.path.join(self.config.RESULTS_PATH, f'{model_name}_results.json')
            with open(results_file, 'w') as f:
                json.dump(results, f, indent=2)
            
            print(f"Results saved to {results_file}")
            print(f"Model training completed successfully!")
            
            return model, results, history
            
        except Exception as e:
            print(f"Error training {model_name}: {e}")
            raise
    
    def train_all_models(self):
        """Train all specified models"""
        results_summary = {}
        
        for model_name in self.config.MODELS_TO_TRAIN:
            try:
                model, results, history = self.train_model(model_name)
                results_summary[model_name] = {
                    'accuracy': results['accuracy'],
                    'auc_score': results['auc_score']
                }
            except Exception as e:
                print(f"Failed to train {model_name}: {e}")
                results_summary[model_name] = {'error': str(e)}
        
        # Save summary
        summary_file = os.path.join(self.config.RESULTS_PATH, 'training_summary.json')
        with open(summary_file, 'w') as f:
            json.dump(results_summary, f, indent=2)
        
        print(f"\n{'='*50}")
        print("TRAINING SUMMARY")
        print(f"{'='*50}")
        for model_name, results in results_summary.items():
            if 'error' not in results:
                print(f"{model_name}: Accuracy={results['accuracy']:.4f}, AUC={results['auc_score']:.4f}")
            else:
                print(f"{model_name}: FAILED - {results['error']}")
        
        return results_summary


# For direct execution (testing purposes)
if __name__ == "__main__":
    import sys
    import os
    # Add parent directory to path so we can import from src
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    
    from src.core.config import Config
    
    print("🚂 Railway Track Fault Detection - Training Pipeline")
    print("=" * 60)
    
    # Initialize configuration and trainer
    config = Config()
    trainer = Trainer(config)
    
    # Run training
    results = trainer.train_all_models()
    
    print("\n✅ Training completed!")
    print("Check the results/ folder for detailed metrics and plots.")