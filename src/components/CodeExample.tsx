import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';

interface CodeExampleProps {
  title: string;
  language: string;
  code: string;
  description?: string;
}

export function CodeExample({ title, language, code, description }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-primary/20 bg-card/50 backdrop-blur overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-primary/5">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs">
            {language}
          </Badge>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-3"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      
      {description && (
        <div className="px-6 py-3 bg-muted/30 border-b border-primary/10">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
      
      <div className="relative">
        <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
          <code className="font-mono text-foreground/90">{code}</code>
        </pre>
      </div>
    </Card>
  );
}
