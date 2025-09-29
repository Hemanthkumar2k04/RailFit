import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';

interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (assetData: AssetData) => void;
}

interface AssetData {
  assetType: string;
  location: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  vendorId: string;
  installDate: string;
  purchaseCost: string;
  warrantyExpiry: string;
}

const assetTypes = [
  'Select Asset Type',
  'Rail Track',
  'Signal Equipment',
  'Rolling Stock',
  'Electrical System',
  'Bridge Component',
  'Station Infrastructure',
  'Safety Equipment',
  'Communication Device',
];

const AddAssetModal: React.FC<AddAssetModalProps> = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AssetData>({
    assetType: '',
    location: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    vendorId: '',
    installDate: '',
    purchaseCost: '',
    warrantyExpiry: '',
  });

  const [showAssetTypePicker, setShowAssetTypePicker] = useState(false);

  const updateField = (field: keyof AssetData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.assetType || !formData.location || !formData.serialNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onSubmit(formData);
    
    // Reset form
    setFormData({
      assetType: '',
      location: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      vendorId: '',
      installDate: '',
      purchaseCost: '',
      warrantyExpiry: '',
    });
    
    onClose();
  };

  const renderAssetTypePicker = () => (
    <Modal
      visible={showAssetTypePicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAssetTypePicker(false)}
    >
      <TouchableOpacity 
        style={styles.pickerOverlay}
        activeOpacity={1}
        onPress={() => setShowAssetTypePicker(false)}
      >
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Select Asset Type</Text>
          <ScrollView>
            {assetTypes.slice(1).map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.pickerItem}
                onPress={() => {
                  updateField('assetType', type);
                  setShowAssetTypePicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Asset</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              {/* Asset Type - Required */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Asset Type <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowAssetTypePicker(true)}
                >
                  <Text style={[
                    styles.pickerText,
                    !formData.assetType && styles.placeholderText
                  ]}>
                    {formData.assetType || 'Select Asset Type'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Location - Required */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Location <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Platform 1, Section A"
                  placeholderTextColor="#9ca3af"
                  value={formData.location}
                  onChangeText={(value) => updateField('location', value)}
                />
              </View>

              {/* Serial Number - Required */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Serial Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Unique serial number"
                  placeholderTextColor="#9ca3af"
                  value={formData.serialNumber}
                  onChangeText={(value) => updateField('serialNumber', value)}
                />
              </View>

              {/* Model */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Model number/name"
                  placeholderTextColor="#9ca3af"
                  value={formData.model}
                  onChangeText={(value) => updateField('model', value)}
                />
              </View>

              {/* Manufacturer */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Manufacturer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Manufacturer name"
                  placeholderTextColor="#9ca3af"
                  value={formData.manufacturer}
                  onChangeText={(value) => updateField('manufacturer', value)}
                />
              </View>

              {/* Vendor ID */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vendor ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vendor identifier"
                  placeholderTextColor="#9ca3af"
                  value={formData.vendorId}
                  onChangeText={(value) => updateField('vendorId', value)}
                />
              </View>

              {/* Install Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Install Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="dd-mm-yyyy"
                  placeholderTextColor="#9ca3af"
                  value={formData.installDate}
                  onChangeText={(value) => updateField('installDate', value)}
                />
              </View>

              {/* Purchase Cost */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Purchase Cost</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={formData.purchaseCost}
                  onChangeText={(value) => updateField('purchaseCost', value)}
                />
              </View>

              {/* Warranty Expiry */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Warranty Expiry</Text>
                <TextInput
                  style={styles.input}
                  placeholder="dd-mm-yyyy"
                  placeholderTextColor="#9ca3af"
                  value={formData.warrantyExpiry}
                  onChangeText={(value) => updateField('warrantyExpiry', value)}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Add Asset</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {renderAssetTypePicker()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#1e293b',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Asset Type Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#374151',
  },
});

export default AddAssetModal;