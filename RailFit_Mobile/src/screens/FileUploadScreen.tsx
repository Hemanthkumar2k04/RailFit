import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
}

const FileUploadScreen: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelectFiles = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      const newFiles: UploadedFile[] = results.map((file, index) => ({
        id: `${Date.now()}_${index}`,
        name: file.name || 'Unknown file',
        size: file.size || 0,
        type: file.type || 'unknown',
        uri: file.uri,
      }));

      setSelectedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled file picker');
      } else {
        Alert.alert('Error', 'Failed to select files. Please try again.');
        console.error('DocumentPicker Error:', error);
      }
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select files to upload first.');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise<void>(resolve => setTimeout(() => resolve(), 3000));
      
      Alert.alert(
        'Upload Complete',
        `Successfully uploaded ${selectedFiles.length} file(s) to the server.`,
        [
          {
            text: 'OK',
            onPress: () => setSelectedFiles([]),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeEmoji = (type: string): string => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('text')) return '📝';
    return '📎';
  };

  const renderFileItem = ({item}: {item: UploadedFile}) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileEmoji}>{getFileTypeEmoji(item.type)}</Text>
        <View style={styles.fileDetails}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFile(item.id)}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📁 File Upload</Text>
      <Text style={styles.subtitle}>
        Select and upload inspection reports, images, or other asset-related files
      </Text>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleSelectFiles}>
        <Text style={styles.selectButtonText}>📂 Select Files</Text>
      </TouchableOpacity>

      {selectedFiles.length > 0 && (
        <View style={styles.filesContainer}>
          <Text style={styles.filesTitle}>
            Selected Files ({selectedFiles.length})
          </Text>
          <FlatList
            data={selectedFiles}
            renderItem={renderFileItem}
            keyExtractor={item => item.id}
            style={styles.filesList}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.disabledButton]}
            onPress={handleUploadFiles}
            disabled={isUploading}>
            <Text style={styles.uploadButtonText}>
              {isUploading ? '⬆️ Uploading...' : '⬆️ Upload Files'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>📋 Supported file types:</Text>
        <Text style={styles.infoText}>• Images: JPG, PNG, HEIC</Text>
        <Text style={styles.infoText}>• Documents: PDF, DOC, DOCX</Text>
        <Text style={styles.infoText}>• Videos: MP4, MOV</Text>
        <Text style={styles.infoText}>• Other: TXT, CSV, XLS</Text>
        <Text style={styles.infoText}>• Maximum file size: 50MB per file</Text>
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
  selectButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  filesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  filesList: {
    flex: 1,
    marginBottom: 20,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748b',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
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

export default FileUploadScreen;