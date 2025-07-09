'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, File, Image, FileText, Download, Eye } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number; // em MB
  maxFiles?: number;
  existingFiles?: UploadedFile[];
  onFileRemove?: (fileId: string) => void;
  className?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadDate: Date;
  thumbnail?: string;
}

export default function FileUpload({
  onFileUpload,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxSize = 10, // 10MB
  maxFiles = 5,
  existingFiles = [],
  onFileRemove,
  className = '',
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`;
    }

    // Verificar tipo
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type);
    });

    if (!isValidType) {
      return `Tipo de arquivo não suportado. Tipos aceitos: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Verificar limite de arquivos
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      errors.push(`Limite de ${maxFiles} arquivos excedido`);
      return;
    }

    // Validar cada arquivo
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Simular upload - em produção, fazer upload real para servidor
      const newFiles: UploadedFile[] = await Promise.all(
        validFiles.map(async (file) => {
          // Simular delay de upload
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Criar thumbnail para imagens
          let thumbnail: string | undefined;
          if (file.type.startsWith('image/')) {
            thumbnail = await createImageThumbnail(file);
          }

          return {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // Em produção, usar URL do servidor
            uploadDate: new Date(),
            thumbnail,
          };
        })
      );

      setUploadedFiles(prev => [...prev, ...newFiles]);
      onFileUpload(validFiles);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload dos arquivos');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, maxFiles, maxSize, acceptedTypes, onFileUpload]);

  const createImageThumbnail = (file: File): Promise<string> => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 150;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemove?.(fileId);
  };

  const handleDownload = (file: UploadedFile) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const openFile = (file: UploadedFile) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Fazendo upload...' : 'Arrastar arquivos aqui'}
            </p>
            <p className="text-sm text-gray-500">
              ou{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={isUploading}
              >
                clique para selecionar
              </button>
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Tipos aceitos: {acceptedTypes.join(', ')}</p>
            <p>Tamanho máximo: {maxSize}MB | Máximo {maxFiles} arquivos</p>
          </div>
        </div>
      </div>

      {/* Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Arquivos ({uploadedFiles.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              
              return (
                <Card key={file.id} className="p-3">
                  <div className="flex items-start space-x-3">
                    {/* Thumbnail or Icon */}
                    <div className="flex-shrink-0">
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <FileIcon className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </h5>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openFile(file)}
                        className="p-1 h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="p-1 h-8 w-8"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 