"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export function VectorSearch() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Vector Search</h3>
        <p className="text-muted-foreground mb-4">
          Semantic search with embeddings coming soon...
        </p>
        <Button disabled>Search Documents</Button>
      </CardContent>
    </Card>
  );
}