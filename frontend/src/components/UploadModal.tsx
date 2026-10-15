import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileText, ArrowRight, Table } from 'lucide-react';
import { uploadDataset } from '../api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
      setError('Please upload a valid CSV file (.csv).');
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const res = await uploadDataset(file);
      setUploadResult(res);
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please check CSV format.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Upload Historical Retail Data</h3>
              <p className="text-xs text-slate-400">Smart schema detection automatically maps your business columns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!uploadResult ? (
            <>
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleChange}
                />
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <FileText className="w-6 h-6" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB — Ready to analyze</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Drag & drop your CSV file here, or <span className="text-indigo-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500">Supports standard sales exports up to 50MB</p>
                  </div>
                )}
              </div>

              {/* Supported Schema Guide */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                  <Table className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Auto-Detected Attributes:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Order Date</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Customer ID</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Product / SKU</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Category</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Quantity</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Unit Price</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Total Sales</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Discount %</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Region / Channel</span>
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            /* Upload Success View with Mapped Schema */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Dataset Analyzed Successfully!</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Imported <strong className="text-slate-200">{uploadResult.rows_loaded?.toLocaleString()}</strong> orders from <strong className="text-slate-200">{uploadResult.filename}</strong>.
                </p>
              </div>

              {/* Mapped columns pill preview */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-left space-y-2">
                <p className="text-xs font-semibold text-slate-300">Column Schema Inferred:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(uploadResult.columns_mapped || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider">{key.replace('_', ' ')}</span>
                      <span className="text-indigo-300 font-mono text-[11px]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
          >
            {uploadResult ? 'Done' : 'Cancel'}
          </button>

          {!uploadResult ? (
            <button
              onClick={handleUploadSubmit}
              disabled={!file || isUploading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <span>{isUploading ? 'Analyzing...' : 'Run Platform Pipeline'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              Explore Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
