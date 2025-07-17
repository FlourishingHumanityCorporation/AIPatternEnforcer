import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
} from "@/components/ui";

export default function Home() {
  return (
    <main className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Your AI App</h1>
        <p className="text-muted-foreground text-lg">
          Get started by editing{" "}
          <code className="bg-muted px-2 py-1 rounded">app/page.tsx</code>
        </p>
        <Badge variant="secondary">Ready to build</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>AI Chat</CardTitle>
            <CardDescription>
              Interact with AI models using the built-in chat API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                placeholder="Ask the AI anything..."
                rows={3}
              />
            </div>
            <Button className="w-full">Send Message</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <CardDescription>Add your API keys to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <Input id="openai" type="password" placeholder="sk-..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anthropic">Anthropic API Key</Label>
              <Input id="anthropic" type="password" placeholder="sk-ant-..." />
            </div>
            <Button variant="outline" className="w-full">
              Save Keys
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Everything you need to build AI apps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">✅ Next.js 14 with App Router</p>
              <p className="text-sm">✅ Tailwind CSS + shadcn/ui</p>
              <p className="text-sm">✅ Prisma + PostgreSQL</p>
              <p className="text-sm">✅ OpenAI & Anthropic ready</p>
              <p className="text-sm">✅ TypeScript configured</p>
            </div>
            <Button variant="secondary" className="w-full">
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Commands</CardTitle>
          <CardDescription>Essential commands for development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">npm run dev</code>
              <p className="text-xs text-muted-foreground mt-1">
                Start development server
              </p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">npm run g:c Button</code>
              <p className="text-xs text-muted-foreground mt-1">
                Generate new component
              </p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">npm run check:all</code>
              <p className="text-xs text-muted-foreground mt-1">
                Run all checks
              </p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">npx prisma db push</code>
              <p className="text-xs text-muted-foreground mt-1">
                Setup database
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
