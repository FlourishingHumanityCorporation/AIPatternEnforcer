"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

export function VisionAnalyzer() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Vision Analysis</h3>
        <p className="text-muted-foreground mb-4">
          Image analysis with GPT-4V and LLaVA coming soon...
        </p>
        <Button disabled>Upload Image</Button>
      </CardContent>
    </Card>
  );
}