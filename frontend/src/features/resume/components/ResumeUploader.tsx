import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeUploaderProps {
  onUploadSuccess: (data: any) => void;
  isUploading: boolean;
  uploadStage: string;
  onStartUpload: (file: File) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  isUploading,
  uploadStage,
  onStartUpload,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      setError('Please select a valid PDF or Word document (.pdf, .docx)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }

    setSelectedFile(file);
    onStartUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-card/60 p-8 shadow-sm transition-all hover:border-primary/60">
      <CardContent className="flex flex-col items-center justify-center text-center p-0">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="py-8 space-y-4 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
              <Sparkles className="h-8 w-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight text-foreground">{uploadStage}</h3>
              <p className="text-xs text-muted-foreground">Google Gemini is evaluating your CV structure & keywords</p>
            </div>
            <div className="w-64 bg-secondary rounded-full h-2 overflow-hidden mt-4">
              <div className="bg-gradient-to-r from-primary to-accent h-full animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`w-full rounded-xl py-10 px-6 transition-all ${
              isDragOver ? 'bg-primary/10 border-primary' : ''
            }`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-4 shadow-xs">
              <Upload className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-bold text-foreground">
              Drag and drop your resume here
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Supports PDF and Word documents (.pdf, .docx) up to 10MB
            </p>

            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <FileText className="h-4 w-4" /> Browse Files
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUploader;
