# SPL-8004 Protocol Integration Map

Bu dokümanda, SPL-8004 ekosisteminde kullanılacak üç yeni protokolün (ACP, TAP, FCP) nasıl entegre edileceği ve hangi sayfalarda/özelliklerde kullanılacağı açıklanmaktadır.

---

## 📡 1. SPL-ACP - Agent Communication Protocol
**Program ID:** `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK`

### Amaç
Agent yeteneklerinin bildirilmesi ve kayıt sistemi. Agent'ların hangi işlevleri desteklediğini on-chain'de ilan etmesini sağlar.

### Kullanım Yerleri

#### 1. `/app/create-agent` - Agent Oluşturma Sayfası
**Entegrasyon:**
- Agent kayıt formuna "Capabilities" sekmesi ekle
- Kullanıcı agent'ın desteklediği yetenekleri seçebilsin:
  ```typescript
  interface AgentCapability {
    name: string;           // "text-generation", "image-analysis", "code-review"
    version: string;        // "1.0.0"
    inputSchema: object;    // JSON Schema for inputs
    outputSchema: object;   // JSON Schema for outputs
  }
  ```
- SPL-ACP programına yetenek bildirimi transaction'ı gönder
- On-chain'de agent capabilities PDA'sı oluştur

**Örnek UI:**
```tsx
// Create Agent sayfasına eklenecek bölüm
<Card>
  <CardHeader>
    <CardTitle>Agent Capabilities (SPL-ACP)</CardTitle>
    <CardDescription>
      Declare what your agent can do - stored on-chain via Agent Communication Protocol
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Select multiple>
      <option value="text-generation">Text Generation</option>
      <option value="data-analysis">Data Analysis</option>
      <option value="code-execution">Code Execution</option>
      {/* ... more capabilities */}
    </Select>
  </CardContent>
</Card>
```

#### 2. `/app/agents` - Agent Listesi
**Entegrasyon:**
- Her agent card'ında SPL-ACP'den çekilen capabilities'i göster
- Agent filtreleme: Yeteneklere göre arama
- Agent detay sayfasında full capability manifest göster

#### 3. `/app/marketplace` - Agent Marketplace
**Entegrasyon:**
- Agent satın alırken/kiralarken capabilities ile filtreleme
- Compatibility check: İhtiyaç duyulan yetenekler vs agent'ın sunduğu yetenekler

---

## 🛡️ 2. SPL-TAP - Tool Attestation Protocol
**Program ID:** `DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4`

### Amaç
Tool attestation verme ve doğrulama. Agent'ların kullandığı araçların (API'ler, SDK'lar, harici servisler) güvenilirliğini on-chain'de doğrular.

### Kullanım Yerleri

#### 1. `/app/attestations` - Attestations Sayfası (ŞU AN BOŞ)
**Tam Implementasyon:**

```tsx
// src/pages/app/Attestations.tsx
import { useState } from 'react';
import { useTAPClient } from '@/hooks/useTAPClient';

export default function Attestations() {
  const { attestTool, verifyAttestation } = useTAPClient();
  const [toolName, setToolName] = useState('');
  const [toolHash, setToolHash] = useState('');
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Tool Attestations (SPL-TAP)</h1>
      
      {/* Attest New Tool */}
      <Card>
        <CardHeader>
          <CardTitle>Attest a Tool</CardTitle>
          <CardDescription>
            Publish on-chain proof that your agent uses verified, audited tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAttestTool}>
            <Input placeholder="Tool name (e.g., OpenAI GPT-4)" />
            <Input placeholder="Tool hash (SHA-256 of source code)" />
            <Input placeholder="Audit report URI" />
            <Button type="submit">Submit Attestation</Button>
          </form>
        </CardContent>
      </Card>

      {/* Verify Tool */}
      <Card>
        <CardHeader>
          <CardTitle>Verify Tool Attestation</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and verify existing attestations */}
        </CardContent>
      </Card>

      {/* Attestation History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Attestations</CardTitle>
        </CardHeader>
        <CardContent>
          {/* List of user's submitted attestations */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Hook Oluştur:**
```typescript
// src/hooks/useTAPClient.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const TAP_PROGRAM_ID = new PublicKey('DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4');

export function useTAPClient() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const attestTool = async (toolName: string, toolHash: string, auditUri: string) => {
    // SPL-TAP instruction: attest_tool
    // Creates on-chain attestation PDA
  };

  const verifyAttestation = async (toolHash: string) => {
    // Query attestation PDA from SPL-TAP program
    // Return attestation metadata
  };

  return { attestTool, verifyAttestation };
}
```

#### 2. `/app/agents/:agentId` - Agent Detay Sayfası
**Entegrasyon:**
- "Tools Used" sekmesi ekle
- Her tool için SPL-TAP attestation durumunu göster:
  - ✅ Verified: On-chain attestation mevcut
  - ⚠️ Unverified: Attestation yok
  - ❌ Revoked: Attestation iptal edilmiş

---

## ⚖️ 3. SPL-FCP - Function Call Protocol
**Program ID:** `A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR`

### Amaç
Çoklu-validator konsensüs doğrulama. Agent işlemlerinin birden fazla validator tarafından onaylanmasını sağlar.

### Kullanım Yerleri

#### 1. `/app/consensus` - Consensus Sayfası (ŞU AN BOŞ)
**Tam Implementasyon:**

```tsx
// src/pages/app/Consensus.tsx
import { useState, useEffect } from 'react';
import { useFCPClient } from '@/hooks/useFCPClient';

export default function Consensus() {
  const { submitForConsensus, getConsensusStatus } = useFCPClient();
  const [pendingValidations, setPendingValidations] = useState([]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Multi-Validator Consensus (SPL-FCP)</h1>

      {/* Pending Consensus Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Validations</CardTitle>
          <CardDescription>
            Agent actions awaiting multi-validator approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingValidations.map(validation => (
              <div key={validation.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{validation.agentId}</p>
                    <p className="text-sm text-slate-400">{validation.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Approvals: {validation.approvals}/{validation.requiredApprovals}</p>
                    <div className="flex gap-1 mt-1">
                      {validation.validators.map(v => (
                        <span key={v.pubkey} className={v.approved ? 'text-green-400' : 'text-slate-600'}>
                          {v.approved ? '✓' : '○'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit New Consensus Request */}
      <Card>
        <CardHeader>
          <CardTitle>Request Consensus</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitConsensus}>
            <Input placeholder="Agent ID" />
            <Input placeholder="Action to validate" />
            <Input placeholder="Required approvals (e.g., 3)" type="number" />
            <Button type="submit">Submit for Consensus</Button>
          </form>
        </CardContent>
      </Card>

      {/* Validator Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Validator Actions</CardTitle>
          <CardDescription>
            Approve or reject pending consensus requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* List of requests where current user is a validator */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Hook Oluştur:**
```typescript
// src/hooks/useFCPClient.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const FCP_PROGRAM_ID = new PublicKey('A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR');

export function useFCPClient() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const submitForConsensus = async (
    agentId: string,
    action: string,
    requiredApprovals: number,
    validators: PublicKey[]
  ) => {
    // SPL-FCP instruction: create_consensus_request
    // Creates PDA with validator list and approval tracking
  };

  const approveConsensus = async (consensusId: string) => {
    // SPL-FCP instruction: approve_consensus
    // Validator signs approval
  };

  const rejectConsensus = async (consensusId: string) => {
    // SPL-FCP instruction: reject_consensus
  };

  const getConsensusStatus = async (consensusId: string) => {
    // Query consensus PDA
    // Return approval status
  };

  return { submitForConsensus, approveConsensus, rejectConsensus, getConsensusStatus };
}
```

#### 2. `/app/validation` - Validation Sayfası
**Entegrasyon:**
- Mevcut submit_validation işlevini SPL-FCP ile güçlendir
- "Require Multi-Validator Consensus" checkbox ekle
- Eğer seçiliyse, doğrudan on-chain validation yerine SPL-FCP consensus request oluştur

---

## 🗂️ Implementasyon Planı

### Faz 1: Client Library'ler (1 hafta)
```
src/lib/
├── acp-client.ts          # SPL-ACP client
├── tap-client.ts          # SPL-TAP client
└── fcp-client.ts          # SPL-FCP client
```

### Faz 2: React Hooks (3 gün)
```
src/hooks/
├── useACP.ts              # Agent capabilities hook
├── useTAP.ts              # Tool attestation hook
└── useFCP.ts              # Consensus hook
```

### Faz 3: UI Components (1 hafta)
- Attestations sayfası tam implementasyon
- Consensus sayfası tam implementasyon
- Create Agent'a capabilities sekmesi
- Agent detay'a tool attestations
- Validation'a multi-validator seçeneği

### Faz 4: Integration Testing (3 gün)
- Devnet test deployment
- End-to-end akış testleri
- UI/UX polish

---

## 🔗 Cross-Protocol İletişim

### Örnek Akış: Yeni Agent Oluşturma + Attestation
1. **SPL-8004:** Agent kaydı (register_agent)
2. **SPL-ACP:** Capabilities bildirimi (declare_capabilities)
3. **SPL-TAP:** Kullanılan toolların attestation'ı (attest_tools)
4. **SPL-FCP:** İlk validation için consensus request (create_consensus)

### Örnek Akış: High-Stakes Validation
1. User `/app/validation` sayfasında "Require Consensus" seçer
2. **SPL-FCP:** Consensus request oluşturulur (3/5 validator onayı gerekli)
3. Validators `/app/consensus` sayfasında isteği görür ve oylar
4. Consensus sağlandığında otomatik olarak **SPL-8004** submit_validation çağrılır
5. Reputation güncellenir

---

## 📊 Dashboard Entegrasyonu

`/app/dashboard` sayfasına eklenecek widget'lar:

```tsx
// Dashboard stats güncellemesi
<div className="grid grid-cols-4 gap-4">
  {/* Mevcut stats... */}
  <Card>
    <CardTitle>Active Capabilities</CardTitle>
    <CardContent>{acpStats.totalCapabilities}</CardContent>
  </Card>
  <Card>
    <CardTitle>Tool Attestations</CardTitle>
    <CardContent>{tapStats.verifiedTools}</CardContent>
  </Card>
  <Card>
    <CardTitle>Pending Consensus</CardTitle>
    <CardContent>{fcpStats.pendingRequests}</CardContent>
  </Card>
</div>
```

---

## 🚀 Deployment Checklist

- [ ] Deploy SPL-ACP client library
- [ ] Deploy SPL-TAP client library
- [ ] Deploy SPL-FCP client library
- [ ] Update Attestations page
- [ ] Update Consensus page
- [ ] Add capabilities to Create Agent
- [ ] Add tool verification to Agent Detail
- [ ] Add multi-validator option to Validation
- [ ] Update Dashboard stats
- [ ] Integration tests on devnet
- [ ] Documentation update
- [ ] User guide for new features

---

## 📝 Notlar

- Tüm protokoller devnet'te deploy edilmiş durumda
- Program ID'ler yukarıda belirtilmiştir
- Client library'ler SPL-8004 client pattern'ini takip edecek
- UI sayfaları mevcut AppLayout içinde çalışacak
- Tüm işlemler Solana wallet adapter kullanacak

**Öncelik Sırası:**
1. SPL-TAP (Attestations) - En çok UI'si eksik
2. SPL-FCP (Consensus) - Kritik güvenlik özelliği
3. SPL-ACP (Capabilities) - Agent discovery için önemli
