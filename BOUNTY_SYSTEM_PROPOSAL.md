# 🎯 X402 Task Bounty System - Mobil Proje Entegrasyonu

## 📋 Özet

**EVET, destekliyoruz!** Mevcut X402 protokolümüz, task-based bounty sistemi için mükemmel bir temel sağlıyor. Önerilen mimari:

**İşveren → Task + USDC Havuzu → Voting → Otomatik Ödeme (X402) → Kazananlar**

---

## ✅ Mevcut X402 Altyapımız

### 🔧 Hazır Olan Özellikler

1. **✅ Instant Payment System**
   - Program ID: `6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia`
   - USDC transferleri (6 decimal precision)
   - %0.5 platform fee, %99.5 alıcıya
   - Gasless transactions via Kora

2. **✅ Payment Client (SDK)**
   ```typescript
   import { createAgent } from '@spl-8004/sdk';
   
   const agent = createAgent({
     agentId: 'mobile-task-app',
     privateKey: process.env.AGENT_PRIVATE_KEY,
     apiKey: process.env.NOEMA_API_KEY,
     network: 'mainnet-beta'
   });
   
   // Otomatik ödeme
   const payment = await agent.makePayment({
     targetEndpoint: 'https://api.taskapp.com/complete-task',
     priceUsd: 10.0,
     metadata: {
       taskId: 'task-123',
       winners: ['wallet1', 'wallet2'],
       distribution: [6.0, 4.0]
     }
   });
   ```

3. **✅ Auto-Pay Flow (402 Protocol)**
   ```
   1. Client request → 402 Payment Required
   2. SDK reads payment requirement
   3. Creates & signs USDC transaction
   4. Facilitator broadcasts via Kora (gasless)
   5. Retries with payment proof
   ```

4. **✅ REST API Endpoints**
   - `POST /api/x402/payment` - Ödeme oluşturma
   - `POST /api/crypto/solana-pay` - Solana Pay entegrasyonu
   - Rate limiting & authentication

---

## 🏗️ Task Bounty Sistemi Mimarisi

### Akış Diyagramı

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TASK BOUNTY FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

1️⃣ İŞVEREN - Task Oluşturma
   │
   ├─→ Task bilgileri (title, description, deadline)
   ├─→ USDC ödül havuzu (örn: 100 USDC)
   └─→ Escrow'a kilitle (X402 Program)
   
2️⃣ ESCROW - Havuz Yönetimi
   │
   ├─→ Task PDA: [task_id, creator]
   ├─→ USDC Token Account (ATA)
   ├─→ State: Open → Voting → Completed → Paid
   └─→ Metadata: taskId, pool, deadline, status
   
3️⃣ VOTING - Kazanan Belirleme
   │
   ├─→ Community voting veya jury
   ├─→ Winner list: [{wallet, score, share}]
   ├─→ Distribution calculation
   └─→ Trigger payment instruction
   
4️⃣ X402 PAYMENT - Otomatik Dağıtım
   │
   ├─→ Multi-recipient payment
   ├─→ Winner 1: 60 USDC (60%)
   ├─→ Winner 2: 30 USDC (30%)
   ├─→ Winner 3: 10 USDC (10%)
   ├─→ Platform fee: %0.5
   └─→ Transaction signature → Explorer link
```

---

## 💻 Teknik İmplementasyon

### Option 1: SDK ile Basit Entegrasyon (Önerilen)

Mevcut X402 SDK'yı kullanarak, backend'den otomatik ödemeler yapabilirsiniz:

```typescript
// backend/services/taskBountyService.ts

import { createAgent } from '@spl-8004/sdk';
import { PublicKey } from '@solana/web3.js';

export class TaskBountyService {
  private agent;
  
  constructor() {
    this.agent = createAgent({
      agentId: 'task-bounty-system',
      privateKey: process.env.BOUNTY_AGENT_PRIVATE_KEY,
      apiKey: process.env.NOEMA_API_KEY,
      network: 'mainnet-beta'
    });
  }
  
  /**
   * 1. Task oluştur ve escrow'a USDC kilitle
   */
  async createTaskWithEscrow(params: {
    taskId: string;
    title: string;
    bountyAmount: number; // USDC
    deadline: Date;
  }) {
    // Database'e task kaydet
    const task = await db.tasks.create({
      id: params.taskId,
      title: params.title,
      bountyAmount: params.bountyAmount,
      deadline: params.deadline,
      status: 'open',
      escrowAddress: null,
    });
    
    // Escrow wallet oluştur (task-specific PDA)
    const escrowPDA = await this.createTaskEscrow(params.taskId);
    
    // İşverenden escrow'a USDC transfer et
    const transferResult = await this.transferToEscrow(
      escrowPDA,
      params.bountyAmount
    );
    
    // Database güncelle
    await db.tasks.update(params.taskId, {
      escrowAddress: escrowPDA.toString(),
      escrowTxSignature: transferResult.signature,
    });
    
    return {
      taskId: params.taskId,
      escrowAddress: escrowPDA.toString(),
      signature: transferResult.signature,
      explorerUrl: `https://solscan.io/tx/${transferResult.signature}`,
    };
  }
  
  /**
   * 2. Voting tamamlandı, kazananlara ödeme yap
   */
  async distributeRewards(params: {
    taskId: string;
    winners: Array<{
      walletAddress: string;
      share: number; // Percentage (0-100)
      points: number;
    }>;
  }) {
    // Task'ı al
    const task = await db.tasks.findOne(params.taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'voting_completed') {
      throw new Error('Task voting not completed');
    }
    
    const totalBounty = task.bountyAmount;
    const payments = [];
    
    // Her kazanana payını öde
    for (const winner of params.winners) {
      const amount = (totalBounty * winner.share) / 100;
      
      // X402 ile otomatik ödeme
      const payment = await this.agent.makePayment({
        targetEndpoint: `https://api.yourtaskapp.com/claim/${task.id}`,
        priceUsd: amount,
        metadata: {
          taskId: task.id,
          recipient: winner.walletAddress,
          share: winner.share,
          points: winner.points,
          timestamp: Date.now(),
        }
      });
      
      payments.push({
        recipient: winner.walletAddress,
        amount,
        signature: payment.signature,
        explorerUrl: payment.explorerUrl,
      });
      
      // Database'e payment kaydı
      await db.payments.create({
        taskId: task.id,
        recipient: winner.walletAddress,
        amount,
        signature: payment.signature,
        timestamp: new Date(),
      });
    }
    
    // Task'ı tamamlandı olarak işaretle
    await db.tasks.update(task.id, {
      status: 'completed',
      paidAt: new Date(),
    });
    
    return {
      taskId: task.id,
      totalDistributed: totalBounty,
      payments,
      status: 'completed',
    };
  }
  
  /**
   * Helper: Task escrow PDA oluştur
   */
  private async createTaskEscrow(taskId: string): Promise<PublicKey> {
    // X402 program ile task-specific PDA
    const [taskPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('task_bounty'),
        Buffer.from(taskId),
      ],
      new PublicKey('6MCoXdFV29c6M4BH42d3YrprW9pZfMKaqEV9BGUzNyia')
    );
    
    return taskPDA;
  }
  
  /**
   * Helper: Escrow'a USDC transfer
   */
  private async transferToEscrow(
    escrowPDA: PublicKey,
    amount: number
  ) {
    // Mevcut X402 payment metodunu kullan
    return await this.agent.makePayment({
      targetEndpoint: 'https://api.yourtaskapp.com/escrow/deposit',
      priceUsd: amount,
      metadata: {
        type: 'escrow_deposit',
        escrowAddress: escrowPDA.toString(),
      }
    });
  }
}
```

---

### Option 2: Custom Escrow Program (İleri Seviye)

Daha kontrollü bir sistem için özel Solana program yazabiliriz:

```rust
// programs/task-bounty/src/lib.rs

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("TaskBounty11111111111111111111111111111111");

#[program]
pub mod task_bounty {
    use super::*;
    
    /// Task oluştur ve escrow başlat
    pub fn create_task(
        ctx: Context<CreateTask>,
        task_id: String,
        bounty_amount: u64,
        deadline: i64,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.creator = ctx.accounts.creator.key();
        task.task_id = task_id;
        task.bounty_amount = bounty_amount;
        task.deadline = deadline;
        task.status = TaskStatus::Open;
        task.total_distributed = 0;
        task.bump = *ctx.bumps.get("task").unwrap();
        
        // USDC'yi escrow'a kilitle
        let cpi_accounts = Transfer {
            from: ctx.accounts.creator_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, bounty_amount)?;
        
        emit!(TaskCreated {
            task_id: task.task_id.clone(),
            creator: task.creator,
            bounty_amount,
        });
        
        Ok(())
    }
    
    /// Voting sonrası kazananlara dağıt
    pub fn distribute_rewards(
        ctx: Context<DistributeRewards>,
        winners: Vec<WinnerShare>,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        
        require!(
            task.status == TaskStatus::VotingCompleted,
            ErrorCode::InvalidTaskStatus
        );
        
        let total_percentage: u16 = winners.iter().map(|w| w.share).sum();
        require!(total_percentage == 100, ErrorCode::InvalidDistribution);
        
        // Her kazanana öde
        for (i, winner) in winners.iter().enumerate() {
            let amount = (task.bounty_amount as u128)
                .checked_mul(winner.share as u128)
                .unwrap()
                .checked_div(100)
                .unwrap() as u64;
            
            // Platform fee (%0.5)
            let fee = amount.checked_mul(5).unwrap().checked_div(1000).unwrap();
            let net_amount = amount.checked_sub(fee).unwrap();
            
            // Transfer to winner
            let seeds = &[
                b"task_bounty",
                task.task_id.as_bytes(),
                &[task.bump],
            ];
            let signer = &[&seeds[..]];
            
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.winner_accounts[i].to_account_info(),
                authority: task.to_account_info(),
            };
            
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(
                cpi_program,
                cpi_accounts,
                signer
            );
            
            token::transfer(cpi_ctx, net_amount)?;
            
            // Fee to treasury
            let fee_cpi = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: task.to_account_info(),
            };
            
            let fee_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                fee_cpi,
                signer
            );
            
            token::transfer(fee_ctx, fee)?;
            
            task.total_distributed += amount;
            
            emit!(RewardDistributed {
                task_id: task.task_id.clone(),
                recipient: winner.wallet,
                amount: net_amount,
                fee,
            });
        }
        
        task.status = TaskStatus::Completed;
        
        Ok(())
    }
}

#[account]
pub struct Task {
    pub creator: Pubkey,
    pub task_id: String,
    pub bounty_amount: u64,
    pub deadline: i64,
    pub status: TaskStatus,
    pub total_distributed: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct WinnerShare {
    pub wallet: Pubkey,
    pub share: u16, // Percentage (0-100)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TaskStatus {
    Open,
    Submissions,
    Voting,
    VotingCompleted,
    Completed,
    Cancelled,
}

#[event]
pub struct TaskCreated {
    pub task_id: String,
    pub creator: Pubkey,
    pub bounty_amount: u64,
}

#[event]
pub struct RewardDistributed {
    pub task_id: String,
    pub recipient: Pubkey,
    pub amount: u64,
    pub fee: u64,
}

#[derive(Accounts)]
#[instruction(task_id: String)]
pub struct CreateTask<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 64 + 8 + 8 + 1 + 8 + 1,
        seeds = [b"task_bounty", task_id.as_bytes()],
        bump
    )]
    pub task: Account<'info, Task>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = creator,
        associated_token::mint = usdc_mint,
        associated_token::authority = task,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeRewards<'info> {
    #[account(
        mut,
        seeds = [b"task_bounty", task.task_id.as_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid task status")]
    InvalidTaskStatus,
    #[msg("Distribution percentages must sum to 100")]
    InvalidDistribution,
}
```

---

## 📱 Mobil App Entegrasyonu

### React Native Örneği

```typescript
// mobile/src/services/bountyService.ts

import { createAgent } from '@spl-8004/sdk';
import { Connection, PublicKey } from '@solana/web3.js';

export class BountyService {
  private agent;
  private connection;
  
  constructor() {
    this.connection = new Connection(
      'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    
    this.agent = createAgent({
      agentId: 'mobile-bounty-app',
      privateKey: await SecureStore.getItemAsync('agent_private_key'),
      apiKey: Config.NOEMA_API_KEY,
      network: 'mainnet-beta'
    });
  }
  
  /**
   * İşveren: Task oluştur
   */
  async createTask(params: {
    title: string;
    description: string;
    bountyUSDC: number;
    deadline: Date;
  }) {
    try {
      // Backend API'ye task bilgilerini gönder
      const response = await fetch(
        `${Config.API_URL}/api/tasks/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(params),
        }
      );
      
      const result = await response.json();
      
      // Task oluşturuldu, escrow'a USDC yatır
      const payment = await this.agent.makePayment({
        targetEndpoint: `${Config.API_URL}/api/escrow/deposit`,
        priceUsd: params.bountyUSDC,
        metadata: {
          taskId: result.taskId,
          creator: await this.getWalletAddress(),
        }
      });
      
      return {
        success: true,
        taskId: result.taskId,
        escrowAddress: result.escrowAddress,
        signature: payment.signature,
        explorerUrl: payment.explorerUrl,
      };
    } catch (error) {
      console.error('Task creation failed:', error);
      throw error;
    }
  }
  
  /**
   * Voting tamamlandı, ödül dağıt
   */
  async distributeRewards(taskId: string) {
    try {
      // Backend'e dağıtım isteği gönder
      const response = await fetch(
        `${Config.API_URL}/api/tasks/${taskId}/distribute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getAuthToken()}`,
          },
        }
      );
      
      const result = await response.json();
      
      // Push notification gönder kazananlara
      for (const payment of result.payments) {
        await this.sendWinnerNotification(
          payment.recipient,
          payment.amount,
          payment.explorerUrl
        );
      }
      
      return result;
    } catch (error) {
      console.error('Reward distribution failed:', error);
      throw error;
    }
  }
  
  /**
   * Kazananı bilgilendir
   */
  private async sendWinnerNotification(
    walletAddress: string,
    amount: number,
    explorerUrl: string
  ) {
    await fetch(`${Config.API_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: walletAddress,
        title: '🎉 Task Ödülü Kazandınız!',
        message: `${amount} USDC ödülünüz cüzdanınıza gönderildi!`,
        data: {
          explorerUrl,
          amount,
        }
      })
    });
  }
}
```

---

## 🎯 Kullanım Senaryoları

### 1. Tek Kazanan Sistemi
```typescript
const service = new TaskBountyService();

// Task oluştur
await service.createTaskWithEscrow({
  taskId: 'design-logo-123',
  title: 'Logo Tasarımı',
  bountyAmount: 50, // 50 USDC
  deadline: new Date('2025-12-01'),
});

// Voting tamamlandı
await service.distributeRewards({
  taskId: 'design-logo-123',
  winners: [
    {
      walletAddress: 'Winner1Wallet...',
      share: 100, // %100
      points: 450,
    }
  ]
});
```

### 2. Çoklu Kazanan Sistemi
```typescript
await service.distributeRewards({
  taskId: 'code-review-456',
  winners: [
    { walletAddress: '1st...', share: 50, points: 500 }, // 50 USDC
    { walletAddress: '2nd...', share: 30, points: 300 }, // 30 USDC
    { walletAddress: '3rd...', share: 20, points: 200 }, // 20 USDC
  ]
});
```

### 3. Topluluk Oylaması ile Dağıtım
```typescript
// Oylama sonuçlarını al
const votingResults = await db.votes.aggregate(taskId);

// En yüksek puana sahip 3 kişiyi seç
const topThree = votingResults
  .sort((a, b) => b.totalVotes - a.totalVotes)
  .slice(0, 3);

// Share hesapla
const winners = topThree.map((result, index) => ({
  walletAddress: result.walletAddress,
  share: index === 0 ? 50 : index === 1 ? 30 : 20,
  points: result.totalVotes,
}));

// Otomatik dağıt
await service.distributeRewards({ taskId, winners });
```

---

## 💰 Ücretlendirme & Ekonomi

### Platform Fee
- **%0.5 platform fee** (X402 protokolü)
- %99.5 kazananlara gidiyor
- Örnek: 100 USDC bounty
  - Kazananlar: 99.5 USDC
  - Platform: 0.5 USDC

### Gas Fees
- **Gasless** (Kora entegrasyonu sayesinde)
- Kullanıcılar SOL ödemez
- Platform backend'den işlem yapar

### Pricing Tiers
```typescript
// Free Tier
dailyTasks: 10,
monthlyVolume: 1000 USDC,

// Pro Tier ($99/mo)
dailyTasks: 100,
monthlyVolume: 50000 USDC,

// Enterprise
unlimited tasks & volume
```

---

## 🔒 Güvenlik Özellikleri

### 1. Escrow Protection
- USDC task oluşturulduğunda kilitlenir
- Voting tamamlanana kadar kimse erişemez
- Program authority tarafından yönetilir

### 2. Multi-Sig Support
```typescript
// Critical operations require multiple signatures
const multisig = await createMultisigEscrow({
  signers: [employer, admin, auditor],
  threshold: 2, // 2/3 required
});
```

### 3. Timelock
```typescript
// Voting deadline geçtikten sonra otomatik dağıt
if (Date.now() > task.deadline) {
  await autoDistributeToTopVoted(taskId);
}
```

### 4. Dispute Resolution
```typescript
// Anlaşmazlık durumunda escrow freeze
await freezeEscrow(taskId);
await openDispute({
  taskId,
  reason: 'Unfair voting',
  evidence: [...],
});
```

---

## 🚀 Entegrasyon Adımları

### Adım 1: SDK Kurulumu
```bash
npm install @spl-8004/sdk @solana/web3.js
```

### Adım 2: Agent Keypair Oluştur
```bash
node -e "import('@spl-8004/sdk').then(m => console.log(m.generateAgentKeypair()))"
```

### Adım 3: API Key Al
https://noemaprotocol.xyz/dashboard

### Adım 4: Backend Servisi Kur
```typescript
// server.ts
import { TaskBountyService } from './services/TaskBountyService';

const bountyService = new TaskBountyService();

app.post('/api/tasks/create', async (req, res) => {
  const result = await bountyService.createTaskWithEscrow(req.body);
  res.json(result);
});

app.post('/api/tasks/:id/distribute', async (req, res) => {
  const result = await bountyService.distributeRewards({
    taskId: req.params.id,
    winners: req.body.winners,
  });
  res.json(result);
});
```

### Adım 5: Mobil App'e Entegre Et
```typescript
// App.tsx
import { BountyService } from './services/bountyService';

const bounty = new BountyService();

const createTask = async () => {
  const result = await bounty.createTask({
    title: taskTitle,
    description: taskDesc,
    bountyUSDC: bountyAmount,
    deadline: selectedDate,
  });
  
  Alert.alert('Success', 
    `Task created! Explorer: ${result.explorerUrl}`
  );
};
```

---

## 📊 Dashboard & Analytics

### Task Tracking
```typescript
const taskStats = await db.tasks.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalBounty: { $sum: '$bountyAmount' },
    }
  }
]);

// Result:
// Open: 15 tasks, 750 USDC
// Voting: 8 tasks, 400 USDC
// Completed: 42 tasks, 2100 USDC
```

### Winner Analytics
```typescript
const topEarners = await db.payments.aggregate([
  {
    $group: {
      _id: '$recipient',
      totalEarned: { $sum: '$amount' },
      tasksCompleted: { $sum: 1 },
    }
  },
  { $sort: { totalEarned: -1 } },
  { $limit: 10 }
]);
```

---

## 🎁 Bonus: Referral System

```typescript
// Referral reward via X402
async distributeReferralReward(
  referrerWallet: string,
  amount: number
) {
  await this.agent.makePayment({
    targetEndpoint: 'https://api.taskapp.com/referral-claim',
    priceUsd: amount,
    metadata: {
      type: 'referral_bonus',
      referrer: referrerWallet,
    }
  });
}
```

---

## 📞 Support & Next Steps

### Teknik Destek
- **Discord:** https://discord.gg/noema
- **GitHub Issues:** https://github.com/NoemaProtocol/SPL--8004/issues
- **Email:** dev@noemaprotocol.xyz

### Örnek Projeler
1. **Bounty System Demo:** `/examples/task-bounty`
2. **Voting Integration:** `/examples/voting-system`
3. **Mobile App Template:** `/examples/react-native-bounty`

### Custom Development
Özel ihtiyaçlarınız için:
- Custom escrow program development
- Multi-chain support (ETH, BNB)
- Advanced voting mechanisms
- Smart contract auditing

---

## ✅ Özet: EVET, Sisteminiz İçin Hazırız!

**Mevcut X402 protokolümüz size şunları sağlıyor:**

✅ Instant USDC payments  
✅ Gasless transactions  
✅ Auto-pay flow (402 protocol)  
✅ SDK & REST API  
✅ %0.5 platform fee  
✅ Escrow support (custom program ile)  
✅ Multi-recipient distribution  
✅ Mobile-friendly integration  

**İhtiyacınız olan:**
1. Backend servis (yukarıdaki kod)
2. Voting mekanizması (kendi sisteminiz)
3. Mobile app entegrasyonu (SDK ile)

**Başlamak için:**
```bash
git clone https://github.com/NoemaProtocol/SPL--8004
cd examples/task-bounty
npm install
npm run dev
```

Sorularınız için: **dev@noemaprotocol.xyz** 🚀
