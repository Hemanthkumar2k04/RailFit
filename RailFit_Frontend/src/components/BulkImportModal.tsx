import React, { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/config/api';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  created_assets: number;
  updated_assets: number;
  skipped_duplicates: number;
  duplicate_strategy_used: string;
  successful_assets: Array<{
    asset_id: string;
    type: string;
    location: string;
    row: number;
    operation?: string;
  }>;
  errors: Array<{
    row: number;
    error: string;
    data: any;
    duplicate_of?: string;
  }>;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<string>('skip');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    const file = files[0];
    
    if (file && (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    } else {
      setError('Please drop a valid CSV file');
    }
  };

  const downloadTemplate = () => {
    const csvContent = `type,location,vendor_id,install_date,warranty_period,health_score,status,description,serial_number,model,manufacturer
Elastic Rail Clip,Platform 1,VENDOR001,2023-01-15,36,85,active,High-strength elastic rail clip,ERC-001,Model-X,ClipCorp
Rail Pad,Junction A,VENDOR002,2023-02-20,24,92,active,Vibration dampening rail pad,RP-001,Heavy-Duty,PadTech
Liner,Bridge-01,VENDOR003,2022-12-10,60,78,maintenance,Track liner component,LNR-001,Pro-Line,LinerCorp
Sleeper,Platform 2,VENDOR001,2023-03-05,30,88,active,Concrete railway sleeper,SLP-001,Heavy-Duty,SleeperTech`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asset_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('jwt_token');
      const url = new URL(API_ENDPOINTS.ASSETS.BULK_IMPORT);
      url.searchParams.append('duplicate_strategy', duplicateStrategy);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result: ImportResult = await response.json();
      setUploadResult(result);
      
      if (result.successful_imports > 0) {
        onSuccess(); // Refresh the asset list
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Import Assets</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Import Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download the CSV template to see the required format</li>
              <li>• Required columns: <strong>type</strong> and <strong>location</strong></li>
              <li>• Valid asset types: Elastic Rail Clip, Rail Pad, Liner, Sleeper</li>
              <li>• Optional columns: vendor_id, install_date, warranty_period, health_score, status, etc.</li>
              <li>• File size limit: 10MB</li>
              <li>• Only Manager or Admin users can perform bulk imports</li>
            </ul>
          </div>

          {/* Duplicate Handling Strategy */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-900 mb-3">Duplicate Handling</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="skip"
                  checked={duplicateStrategy === 'skip'}
                  onChange={(e) => setDuplicateStrategy(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-medium text-amber-900">Skip Duplicates</span>
                  <p className="text-sm text-amber-700">Skip assets that already exist (recommended)</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="update"
                  checked={duplicateStrategy === 'update'}
                  onChange={(e) => setDuplicateStrategy(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-medium text-amber-900">Update Existing</span>
                  <p className="text-sm text-amber-700">Update existing assets with new data</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="create_anyway"
                  checked={duplicateStrategy === 'create_anyway'}
                  onChange={(e) => setDuplicateStrategy(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-medium text-amber-900">Create Anyway</span>
                  <p className="text-sm text-amber-700">Create new assets even if duplicates exist</p>
                </div>
              </label>
            </div>
          </div>

          {/* Template Download */}
          <div className="flex justify-center">
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload Area */}
          {!uploadResult && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">Supports CSV files up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-2"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
            </div>
          )}

          {/* Selected File */}
          {selectedFile && !uploadResult && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedFile(null)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900">Upload Error</h4>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3 text-center">
                  <div className="text-xl font-bold text-green-600">
                    {uploadResult.created_assets || 0}
                  </div>
                  <div className="text-xs text-gray-600">Created</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {uploadResult.updated_assets || 0}
                  </div>
                  <div className="text-xs text-gray-600">Updated</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-xl font-bold text-amber-600">
                    {uploadResult.skipped_duplicates || 0}
                  </div>
                  <div className="text-xs text-gray-600">Skipped</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-xl font-bold text-red-600">
                    {uploadResult.failed_imports}
                  </div>
                  <div className="text-xs text-gray-600">Failed</div>
                </Card>
              </div>
              
              {/* Strategy Used */}
              <div className="text-center text-sm text-gray-600">
                Strategy used: <span className="font-medium capitalize">{uploadResult.duplicate_strategy_used?.replace('_', ' ')}</span>
              </div>

              {/* Successful Imports */}
              {uploadResult.successful_assets.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Successfully Imported Assets
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {uploadResult.successful_assets.map((asset, index) => (
                        <div key={index} className="text-sm text-green-800">
                          Row {asset.row}: {asset.type} at {asset.location} (ID: {asset.asset_id.slice(0, 8)}...)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Failed Imports */}
              {uploadResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Import Errors
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-800">
                          <strong>Row {error.row}:</strong> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-3 pt-4">
                <Button onClick={resetModal} variant="outline">
                  Import Another File
                </Button>
                <Button onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;