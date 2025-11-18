/**
 * SPL-8004 Program IDL
 * Program ID: G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW
 */

export type Spl8004 = {
  address: 'G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW';
  metadata: {
    name: 'spl_8004';
    version: '0.1.0';
    spec: '0.1.0';
  };
  version: '0.1.0';
  name: 'spl_8004';
  instructions: [
    {
      name: 'initializeConfig';
      accounts: [
        { name: 'config'; isMut: true; isSigner: false },
        { name: 'authority'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [
        { name: 'commissionRate'; type: 'u16' },
        { name: 'treasury'; type: 'publicKey' }
      ];
    },
    {
      name: 'registerAgent';
      accounts: [
        { name: 'identityRegistry'; isMut: true; isSigner: false },
        { name: 'reputationRegistry'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: true; isSigner: true },
        { name: 'config'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [
        { name: 'agentId'; type: 'string' },
        { name: 'metadataUri'; type: 'string' }
      ];
    },
    {
      name: 'updateMetadata';
      accounts: [
        { name: 'identityRegistry'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: false; isSigner: true }
      ];
      args: [{ name: 'newMetadataUri'; type: 'string' }];
    },
    {
      name: 'submitValidation';
      accounts: [
        { name: 'validationRegistry'; isMut: true; isSigner: false },
        { name: 'agentReputation'; isMut: false; isSigner: false },
        { name: 'validator'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [
        { name: 'taskHash'; type: { array: ['u8', 32] } },
        { name: 'approved'; type: 'bool' },
        { name: 'evidenceUri'; type: 'string' }
      ];
    },
    {
      name: 'updateReputation';
      accounts: [
        { name: 'reputationRegistry'; isMut: true; isSigner: false },
        { name: 'validationRegistry'; isMut: false; isSigner: false },
        { name: 'authority'; isMut: false; isSigner: true }
      ];
      args: [];
    },
    {
      name: 'deactivateAgent';
      accounts: [
        { name: 'identityRegistry'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: false; isSigner: true }
      ];
      args: [];
    },
    {
      name: 'claimRewards';
      accounts: [
        { name: 'rewardPool'; isMut: true; isSigner: false },
        { name: 'agent'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'GlobalConfig';
      type: {
        kind: 'struct';
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'treasury'; type: 'publicKey' },
          { name: 'commissionRate'; type: 'u16' },
          { name: 'totalAgents'; type: 'u64' },
          { name: 'totalValidations'; type: 'u64' },
          { name: 'bump'; type: 'u8' }
        ];
      };
    },
    {
      name: 'IdentityRegistry';
      type: {
        kind: 'struct';
        fields: [
          { name: 'owner'; type: 'publicKey' },
          { name: 'agentId'; type: 'string' },
          { name: 'metadataUri'; type: 'string' },
          { name: 'createdAt'; type: 'i64' },
          { name: 'updatedAt'; type: 'i64' },
          { name: 'isActive'; type: 'bool' },
          { name: 'bump'; type: 'u8' }
        ];
      };
    },
    {
      name: 'ReputationRegistry';
      type: {
        kind: 'struct';
        fields: [
          { name: 'agent'; type: 'publicKey' },
          { name: 'score'; type: 'u64' },
          { name: 'totalTasks'; type: 'u64' },
          { name: 'successfulTasks'; type: 'u64' },
          { name: 'failedTasks'; type: 'u64' },
          { name: 'lastUpdated'; type: 'i64' },
          { name: 'stakeAmount'; type: 'u64' },
          { name: 'bump'; type: 'u8' }
        ];
      };
    },
    {
      name: 'ValidationRegistry';
      type: {
        kind: 'struct';
        fields: [
          { name: 'agent'; type: 'publicKey' },
          { name: 'validator'; type: 'publicKey' },
          { name: 'taskHash'; type: { array: ['u8', 32] } },
          { name: 'approved'; type: 'bool' },
          { name: 'timestamp'; type: 'i64' },
          { name: 'evidenceUri'; type: 'string' },
          { name: 'bump'; type: 'u8' }
        ];
      };
    },
    {
      name: 'RewardPool';
      type: {
        kind: 'struct';
        fields: [
          { name: 'agent'; type: 'publicKey' },
          { name: 'claimableAmount'; type: 'u64' },
          { name: 'lastClaim'; type: 'i64' },
          { name: 'totalClaimed'; type: 'u64' },
          { name: 'bump'; type: 'u8' }
        ];
      };
    }
  ];
  errors: [];
};

export const IDL: Spl8004 = {
  address: 'G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW',
  metadata: {
    name: 'spl_8004',
    version: '0.1.0',
    spec: '0.1.0'
  },
  version: '0.1.0',
  name: 'spl_8004',
  instructions: [
    {
      name: 'initializeConfig',
      accounts: [
        { name: 'config', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'commissionRate', type: 'u16' },
        { name: 'treasury', type: 'publicKey' }
      ]
    },
    {
      name: 'registerAgent',
      accounts: [
        { name: 'identityRegistry', isMut: true, isSigner: false },
        { name: 'reputationRegistry', isMut: true, isSigner: false },
        { name: 'owner', isMut: true, isSigner: true },
        { name: 'config', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'agentId', type: 'string' },
        { name: 'metadataUri', type: 'string' }
      ]
    },
    {
      name: 'updateMetadata',
      accounts: [
        { name: 'identityRegistry', isMut: true, isSigner: false },
        { name: 'owner', isMut: false, isSigner: true }
      ],
      args: [{ name: 'newMetadataUri', type: 'string' }]
    },
    {
      name: 'submitValidation',
      accounts: [
        { name: 'validationRegistry', isMut: true, isSigner: false },
        { name: 'agentReputation', isMut: false, isSigner: false },
        { name: 'validator', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'taskHash', type: { array: ['u8', 32] } },
        { name: 'approved', type: 'bool' },
        { name: 'evidenceUri', type: 'string' }
      ]
    },
    {
      name: 'updateReputation',
      accounts: [
        { name: 'reputationRegistry', isMut: true, isSigner: false },
        { name: 'validationRegistry', isMut: false, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true }
      ],
      args: []
    },
    {
      name: 'deactivateAgent',
      accounts: [
        { name: 'identityRegistry', isMut: true, isSigner: false },
        { name: 'owner', isMut: false, isSigner: true }
      ],
      args: []
    },
    {
      name: 'claimRewards',
      accounts: [
        { name: 'rewardPool', isMut: true, isSigner: false },
        { name: 'agent', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: 'GlobalConfig',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'treasury', type: 'publicKey' },
          { name: 'commissionRate', type: 'u16' },
          { name: 'totalAgents', type: 'u64' },
          { name: 'totalValidations', type: 'u64' },
          { name: 'bump', type: 'u8' }
        ]
      }
    },
    {
      name: 'IdentityRegistry',
      type: {
        kind: 'struct',
        fields: [
          { name: 'owner', type: 'publicKey' },
          { name: 'agentId', type: 'string' },
          { name: 'metadataUri', type: 'string' },
          { name: 'createdAt', type: 'i64' },
          { name: 'updatedAt', type: 'i64' },
          { name: 'isActive', type: 'bool' },
          { name: 'bump', type: 'u8' }
        ]
      }
    },
    {
      name: 'ReputationRegistry',
      type: {
        kind: 'struct',
        fields: [
          { name: 'agent', type: 'publicKey' },
          { name: 'score', type: 'u64' },
          { name: 'totalTasks', type: 'u64' },
          { name: 'successfulTasks', type: 'u64' },
          { name: 'failedTasks', type: 'u64' },
          { name: 'lastUpdated', type: 'i64' },
          { name: 'stakeAmount', type: 'u64' },
          { name: 'bump', type: 'u8' }
        ]
      }
    },
    {
      name: 'ValidationRegistry',
      type: {
        kind: 'struct',
        fields: [
          { name: 'agent', type: 'publicKey' },
          { name: 'validator', type: 'publicKey' },
          { name: 'taskHash', type: { array: ['u8', 32] } },
          { name: 'approved', type: 'bool' },
          { name: 'timestamp', type: 'i64' },
          { name: 'evidenceUri', type: 'string' },
          { name: 'bump', type: 'u8' }
        ]
      }
    },
    {
      name: 'RewardPool',
      type: {
        kind: 'struct',
        fields: [
          { name: 'agent', type: 'publicKey' },
          { name: 'claimableAmount', type: 'u64' },
          { name: 'lastClaim', type: 'i64' },
          { name: 'totalClaimed', type: 'u64' },
          { name: 'bump', type: 'u8' }
        ]
      }
    }
  ],
  errors: []
};
