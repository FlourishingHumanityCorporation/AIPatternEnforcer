"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAI } from "@/hooks/use-ai";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Table,
  FileImage,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ProcessedDocument {
  id: string;
  filename: string;
  status: "processing" | "completed" | "failed";
  extractedText?: string;
  summary?: string;
  entities?: any[];
  tables?: any[];
  error?: string;
}

export function DocumentProcessor() {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ProcessedDocument | null>(
    null,
  );
  const { toast } = useToast();
  const { extract, isExtracting } = useAI();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const docId = Math.random().toString(36).substring(7);
        const newDoc: ProcessedDocument = {
          id: docId,
          filename: file.name,
          status: "processing",
        };

        setDocuments((prev) => [...prev, newDoc]);

        // Process the document
        try {
          // Call the extract mutation directly
          const result = await extract({ file, extractionType: "all" });

          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === docId
                ? {
                    ...doc,
                    status: "completed",
                    extractedText: result.text,
                    summary: result.summary,
                    entities: result.entities,
                    tables: result.tables,
                  }
                : doc,
            ),
          );

          toast({
            title: "Document processed",
            description: `Successfully extracted content from ${file.name}`,
          });
        } catch (error: any) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === docId
                ? {
                    ...doc,
                    status: "failed",
                    error: error.message,
                  }
                : doc,
            ),
          );

          toast({
            variant: "destructive",
            title: "Document processing failed",
            description: `Failed to process ${file.name}: ${error.message}`,
          });
        }
      }
    },
    [extract, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload Area */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload PDFs, Word documents, images, or text files for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop the files here..."
                  : "Drag & drop files here, or click to select"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOCX, TXT, Images (max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle>Processed Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    No documents uploaded yet
                  </p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors",
                        selectedDoc?.id === doc.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50",
                      )}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.filename}</p>
                          <div className="flex items-center gap-2">
                            {doc.status === "processing" && (
                              <Badge variant="secondary" className="text-xs">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Processing
                              </Badge>
                            )}
                            {doc.status === "completed" && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Completed
                              </Badge>
                            )}
                            {doc.status === "failed" && (
                              <Badge variant="destructive" className="text-xs">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Results View */}
      <Card>
        <CardHeader>
          <CardTitle>Extraction Results</CardTitle>
          <CardDescription>
            {selectedDoc
              ? `Results for ${selectedDoc.filename}`
              : "Select a document to view results"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDoc ? (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              <p>No document selected</p>
            </div>
          ) : selectedDoc.status === "processing" ? (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing document...
              </p>
              <Progress value={33} className="w-[200px]" />
            </div>
          ) : selectedDoc.status === "failed" ? (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
              <XCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">{selectedDoc.error}</p>
            </div>
          ) : (
            <Tabs defaultValue="text" className="h-[400px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="text">
                  <FileText className="mr-2 h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="summary">
                  <Eye className="mr-2 h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="entities">
                  <Table className="mr-2 h-4 w-4" />
                  Entities
                </TabsTrigger>
                <TabsTrigger value="tables">
                  <FileImage className="mr-2 h-4 w-4" />
                  Tables
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="h-full">
                <ScrollArea className="h-[350px] rounded-md border p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {selectedDoc.extractedText || "No text extracted"}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="summary" className="h-full">
                <ScrollArea className="h-[350px] rounded-md border p-4">
                  <p className="text-sm leading-relaxed">
                    {selectedDoc.summary || "No summary generated"}
                  </p>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="entities" className="h-full">
                <ScrollArea className="h-[350px] rounded-md border p-4">
                  {selectedDoc.entities && selectedDoc.entities.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDoc.entities.map((entity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">{entity.type}</Badge>
                          <span className="text-sm">{entity.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No entities found
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tables" className="h-full">
                <ScrollArea className="h-[350px] rounded-md border p-4">
                  {selectedDoc.tables && selectedDoc.tables.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDoc.tables.map((table, index) => (
                        <div key={index} className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-border">
                            <tbody className="divide-y divide-border">
                              {table.rows.map((row: any, rowIndex: number) => (
                                <tr key={rowIndex}>
                                  {row.cells.map(
                                    (cell: any, cellIndex: number) => (
                                      <td
                                        key={cellIndex}
                                        className="px-3 py-2 text-sm"
                                      >
                                        {cell}
                                      </td>
                                    ),
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tables found
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
