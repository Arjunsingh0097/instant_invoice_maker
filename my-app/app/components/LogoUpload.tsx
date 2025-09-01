'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Upload } from 'lucide-react';

interface LogoUploadProps {
  onLogoChange: (logo: string | null) => void;
}

export default function LogoUpload({ onLogoChange }: LogoUploadProps) {
  const [logo, setLogo] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/80 mb-2">
        Company Logo
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {logo ? (
        <div className="relative glass-card rounded-xl p-6 text-center group">
          <div className="relative inline-block">
            <img
              src={logo}
              alt="Company Logo"
              className="max-h-20 mx-auto mb-3 rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <button
            onClick={handleRemoveLogo}
            className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 backdrop-blur-sm"
            title="Remove logo"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs text-white/60 mt-2">Click to change logo</p>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`glass-card rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group ${
            isDragOver ? 'scale-105 neon-border' : 'hover:scale-102 hover:neon-border'
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="mx-auto w-16 h-16 glass rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-8 w-8 text-white/70 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                Upload Logo
              </h3>
              <p className="text-sm text-white/60 mb-2">Drag & drop or click to upload</p>
              <p className="text-xs text-white/40">PNG, JPG, SVG up to 5MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
