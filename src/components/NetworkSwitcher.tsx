import { useNetwork } from './NetworkProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  return (
    <div className="min-w-[170px]">
      <Select value={network} onValueChange={(v) => setNetwork((v as 'devnet'|'mainnet-beta'|'testnet'))}>
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="devnet">Devnet (Test)</SelectItem>
          <SelectItem value="mainnet-beta">Mainnet (Live)</SelectItem>
          <SelectItem value="testnet">Testnet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
