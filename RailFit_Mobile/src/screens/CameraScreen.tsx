import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {launchCamera, launchImageLibrary, ImagePickerResponse, MediaType} from 'react-native-image-picker';

const {width} = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as any,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        console.log('Camera cancelled or error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri || null);
      }
    });
  };

  const handleSelectFromGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as any,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        console.log('Gallery cancelled or error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri || null);
      }
    });
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate AI analysis
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      Alert.alert(
        'Analysis Complete',
        'AI analysis detected: No defects found. Asset appears to be in good condition.',
        [{text: 'OK'}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Asset Inspection</Text>
      <Text style={styles.subtitle}>
        Capture or select an image of railway assets for AI-powered defect detection
      </Text>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{uri: selectedImage}} style={styles.selectedImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📸</Text>
            <Text style={styles.placeholderSubtext}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleTakePhoto}>
          <Text style={styles.primaryButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSelectFromGallery}>
          <Text style={styles.secondaryButtonText}>🖼️ Select from Gallery</Text>
        </TouchableOpacity>

        {selectedImage && (
          <TouchableOpacity
            style={[styles.analyzeButton, isLoading && styles.disabledButton]}
            onPress={handleAnalyzeImage}
            disabled={isLoading}>
            <Text style={styles.analyzeButtonText}>
              {isLoading ? '🔍 Analyzing...' : '🤖 Analyze with AI'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Tips for better results:</Text>
        <Text style={styles.infoText}>• Ensure good lighting conditions</Text>
        <Text style={styles.infoText}>• Keep the camera steady</Text>
        <Text style={styles.infoText}>• Focus on the asset clearly</Text>
        <Text style={styles.infoText}>• Capture multiple angles if needed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  selectedImage: {
    width: width - 40,
    height: (width - 40) * 0.75,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: width - 40,
    height: (width - 40) * 0.75,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: '#94a3b8',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#64748b',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  infoContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default CameraScreen;