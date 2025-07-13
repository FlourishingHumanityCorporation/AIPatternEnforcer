"use client";

import { useState } from "react";
import { useAI } from "@/hooks/use-ai";
import { useAIStore } from "@/store/ai-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, StopCircle, Trash2, Cpu, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/ui/use-toast";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const {
    messages,
    sendMessage,
    isLoading,
    isStreaming,
    streamedResponse,
    stopStreaming,
    clearMessages,
    models
  } = useAI({ stream: true });

  const { preferLocal, preferredModel } = useAIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    try {
      await sendMessage(input);
      setInput("");
    } catch (error: any) {
      logger.error("Failed to send message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description:
        error.message ||
        "Could not connect to AI model. Check if Ollama is running."
      });
    }
  };

  const currentModel = models?.models?.local?.find(
    (m: any) => m.id === preferredModel
  ) ?
  { name: preferredModel, type: "local" } :
  { name: preferredModel, type: "api" };

  return (
    <Card className="flex h-[600px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">AI Chat</h2>
          <Badge
            variant={currentModel.type === "local" ? "default" : "secondary"}>

            {currentModel.type === "local" ?
            <Cpu className="mr-1 h-3 w-3" /> :

            <Cloud className="mr-1 h-3 w-3" />
            }
            {currentModel.name}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearMessages}
          disabled={messages.length === 0}>

          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) =>
          <div
            key={index}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}>

              <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.role === "user" ?
                "bg-primary text-primary-foreground" :
                "bg-muted"
              )}>

                {message.role === "assistant" ?
              <ReactMarkdown className="prose prose-sm dark:prose-invert">
                    {message.content}
                  </ReactMarkdown> :

              <p className="text-sm">{message.content}</p>
              }
                {message.model &&
              <p className="mt-1 text-xs opacity-50">via {message.model}</p>
              }
              </div>
            </div>
          )}

          {/* Streaming response */}
          {isStreaming && streamedResponse &&
          <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                <ReactMarkdown className="prose prose-sm dark:prose-invert">
                  {streamedResponse}
                </ReactMarkdown>
                <Loader2 className="mt-2 h-4 w-4 animate-spin" />
              </div>
            </div>
          }

          {/* Loading state */}
          {isLoading && !isStreaming &&
          <div className="flex justify-start">
              <div className="rounded-lg bg-muted px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          }
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything... (using ${preferLocal ? "local" : "API"} model)`}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }} />

          <div className="flex flex-col gap-2">
            {isStreaming ?
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={stopStreaming}>

                <StopCircle className="h-4 w-4" />
              </Button> :

            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}>

                <Send className="h-4 w-4" />
              </Button>
            }
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {preferLocal ? "Using local model" : "Using API"}
            {models?.models?.local?.length === 0 &&
            preferLocal &&
            " (no local models available)"}
          </span>
          <span>Shift+Enter for new line</span>
        </div>
      </form>
    </Card>);

}