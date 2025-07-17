"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Image, File, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ProcessingResult {
  text: string;
  confidence: number;
  pages?: number;
  processingTime: number;
  method: string;
}

export function DocumentProcessor() {
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processDocument = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/process-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process document");
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Document processed successfully!");
    },
    onError: (error) => {
      toast.error("Failed to process document");
      console.error("Processing error:", error);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1,
  });

  const handleProcess = () => {
    if (selectedFile) {
      processDocument.mutate(selectedFile);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg">Drop your document here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Drag & drop a document, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, and image files (PNG, JPG, etc.)
            </p>
          </div>
        )}
      </div>

      {/* Selected File */}
      {selectedFile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile.type)}
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleProcess}
                  disabled={processDocument.isPending}
                  size="sm"
                >
                  {processDocument.isPending ? "Processing..." : "Process"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setResult(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {processDocument.isPending && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing document...</span>
                <span className="text-sm text-muted-foreground">Please wait</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Processing Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Method:</span>
                  <p className="font-medium">{result.method.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <p className="font-medium">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                {result.pages && (
                  <div>
                    <span className="text-muted-foreground">Pages:</span>
                    <p className="font-medium">{result.pages}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <p className="font-medium">{result.processingTime}ms</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Extracted Text:</h4>
                <ScrollArea className="h-48 w-full border rounded p-3">
                  <pre className="text-sm whitespace-pre-wrap">{result.text}</pre>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}