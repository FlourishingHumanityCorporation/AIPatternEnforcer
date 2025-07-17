"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Eye, Search } from "lucide-react";
import { ChatInterface } from "@/components/ai/chat-interface";
import { DocumentProcessor } from "@/components/ai/document-processor";
import { VisionAnalyzer } from "@/components/ai/vision-analyzer";
import { VectorSearch } from "@/components/ai/vector-search";

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState("chat");

  const features = [
    {
      id: "chat",
      title: "AI Chat",
      description: "Multi-provider chat with OpenAI, Anthropic, and local models",
      icon: MessageSquare,
      component: ChatInterface
    },
    {
      id: "documents",
      title: "Document Processing", 
      description: "OCR, PDF parsing, and document analysis",
      icon: FileText,
      component: DocumentProcessor
    },
    {
      id: "vision",
      title: "Vision Analysis",
      description: "Image analysis with GPT-4V and LLaVA",
      icon: Eye,
      component: VisionAnalyzer
    },
    {
      id: "search",
      title: "Vector Search",
      description: "Semantic search with embeddings",
      icon: Search,
      component: VectorSearch
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Unified AI Starter</h1>
        <p className="text-xl text-muted-foreground">
          Complete AI toolkit with chat, document processing, vision analysis, and vector search
        </p>
      </div>

      <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {feature.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {features.map((feature) => {
          const Component = feature.component;
          return (
            <TabsContent key={feature.id} value={feature.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="h-5 w-5" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Component />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}