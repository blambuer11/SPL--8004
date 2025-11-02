import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSPL8004 } from "@/hooks/useSPL8004";
import { useToast } from "@/hooks/use-toast";
import { getExplorerTxUrl } from "@/lib/utils";

interface SponsorDialogProps {
  agentId: string;
  trigger: React.ReactNode;
}

export function SponsorDialog({ agentId, trigger }: SponsorDialogProps) {
  const { client, connected } = useSPL8004();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amountSol, setAmountSol] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    if (!client) return;
    const n = Number(amountSol);
    if (!connected) {
      toast({ title: "Wallet required", description: "Please connect your wallet to sponsor." });
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a SOL amount greater than 0." });
      return;
    }
    const lamports = Math.round(n * 1_000_000_000);
    setLoading(true);
    try {
      const sig = await client.fundRewardPool(agentId, lamports);
      const href = getExplorerTxUrl(sig);
      toast({
        title: "Transaction sent",
        description: (
          <span>
            <span className="mr-2">Signature:</span>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 text-blue-600 hover:text-blue-700"
            >
              View on Explorer
            </a>
          </span>
        ),
      });
      setOpen(false);
      setAmountSol("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Transaction failed", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sponsor Agent</DialogTitle>
          <DialogDescription>
            Add SOL to the reward pool of {agentId}. This incentivizes tasks and validations for this agent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <label className="text-sm text-muted-foreground">Amount (SOL)</label>
          <Input
            type="number"
            min={0}
            step={0.001}
            placeholder="0.10"
            value={amountSol}
            onChange={(e) => setAmountSol(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} disabled={loading}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
