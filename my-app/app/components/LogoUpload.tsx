'use client';

import { useState, useRef } from 'react';
import { X, Upload, Crop, Check, RotateCcw } from 'lucide-react';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface LogoUploadProps {
  onLogoChange: (logo: string | null) => void;
}

export default function LogoUpload({ onLogoChange }: LogoUploadProps) {
  const [logo, setLogo] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setIsCropping(true);
        setCrop({
          unit: '%',
          width: 100,
          height: 100,
          x: 0,
          y: 0,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setOriginalImage(null);
    setIsCropping(false);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (crop: PixelCrop) => {
    setCrop(crop);
  };

  const handleCropSave = () => {
    if (imgRef.current && crop.width && crop.height) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        
        ctx.drawImage(
          imgRef.current,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width * scaleX,
          crop.height * scaleY
        );
        
        const croppedImage = canvas.toDataURL('image/png');
        setLogo(croppedImage);
        onLogoChange(croppedImage);
        setIsCropping(false);
        setOriginalImage(null);
      }
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setOriginalImage(null);
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
        setOriginalImage(result);
        setIsCropping(true);
        setCrop({
          unit: '%',
          width: 100,
          height: 100,
          x: 0,
          y: 0,
        });
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
      
      {isCropping && originalImage ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Crop Logo</h3>
          <div className="relative mb-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={handleCropComplete}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={originalImage}
                alt="Crop preview"
                className="max-h-64 mx-auto rounded-lg"
              />
            </ReactCrop>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCropSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300"
            >
              <Check className="h-4 w-4" />
              Save Crop
            </button>
            <button
              onClick={handleCropCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
            >
              <RotateCcw className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : logo ? (
        <div className="relative glass-card rounded-xl p-6 text-center group">
          <div className="relative inline-block">
            <img
              src={logo}
              alt="Company Logo"
              className="w-20 h-20 mx-auto mb-3 rounded-full shadow-lg object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex gap-2 justify-center mb-3">
            <button
              onClick={() => {
                setOriginalImage(logo);
                setIsCropping(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 text-sm"
            >
              <Crop className="h-3 w-3" />
              Recrop
            </button>
            <button
              onClick={handleRemoveLogo}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300 text-sm"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
          <p className="text-xs text-white/60">Logo uploaded successfully</p>
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
