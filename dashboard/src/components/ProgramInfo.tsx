import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, FileText, Cpu } from 'lucide-react';
import { SPL8004_PROGRAM_ID } from '@/lib/noema8004-client';

export function ProgramInfo() {
  const programId = SPL8004_PROGRAM_ID.toString();
  const explorerUrl = `https://explorer.solana.com/address/${programId}?cluster=devnet`;
  const techDocUrl = `https://github.com/blambuer11/NOEMA-8004/blob/main/docs/SPL-X-Framework.md`;
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          NOEMA-8004 Program Info
        </CardTitle>
        <CardDescription>
          Trustless AI Agent Identity & Reputation Standard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Program ID:</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 font-mono text-xs"
              onClick={() => {
                navigator.clipboard.writeText(programId);
              }}
            >
              {programId.slice(0, 8)}...{programId.slice(-8)}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <span className="text-sm font-medium">Devnet</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className="text-sm font-medium text-success">Active</span>
          </div>
        </div>

        <div className="pt-4 space-y-2 border-t border-border/50">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <span className="text-sm">View on Explorer</span>
            <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          
          <a
            href="https://github.com/noema-8004"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <span className="text-sm">GitHub Repository</span>
            <Github className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          
          <a
            href="https://docs.solana.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <span className="text-sm">Documentation</span>
            <FileText className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <a
            href={techDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <span className="text-sm">SPL-X Technical Architecture</span>
            <FileText className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
