import { Contract, JsonRpcProvider } from 'ethers'

export interface DepositParams {
  submissionBaseDeposit: bigint
  submissionChallengeBaseDeposit: bigint
  removalBaseDeposit: bigint
  removalChallengeBaseDeposit: bigint
  arbitrator: string
  arbitratorExtraData: string
  arbitrationCost: bigint
}

const LGTCRViewABI = [
  {
    constant: true,
    inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
    name: 'fetchArbitrable',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'governor', type: 'address' },
          { internalType: 'address', name: 'arbitrator', type: 'address' },
          { internalType: 'bytes', name: 'arbitratorExtraData', type: 'bytes' },
          {
            internalType: 'uint256',
            name: 'submissionBaseDeposit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'removalBaseDeposit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'submissionChallengeBaseDeposit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'removalChallengeBaseDeposit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'challengePeriodDuration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'metaEvidenceUpdates',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'winnerStakeMultiplier',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'loserStakeMultiplier',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'sharedStakeMultiplier',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'MULTIPLIER_DIVISOR',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'arbitrationCost', type: 'uint256' },
        ],
        internalType: 'struct LightGeneralizedTCRView.ArbitrableData',
        name: 'result',
        type: 'tuple',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const LGTCRViewAddress = '0xB32e38B08FcC7b7610490f764b0F9bFd754dCE53'

export const fetchRegistryDeposits = async (
  registry: string
): Promise<DepositParams | undefined> => {
  // registry still unknown
  if (!registry) return undefined

  try {
    const provider = new JsonRpcProvider('https://rpc.gnosischain.com', 100)

    const lgtcrViewContract = new Contract(
      LGTCRViewAddress,
      LGTCRViewABI,
      provider
    )
    const viewInfo = await lgtcrViewContract.fetchArbitrable(registry)
    const depositParams: DepositParams = {
      submissionBaseDeposit: viewInfo.submissionBaseDeposit,
      submissionChallengeBaseDeposit: viewInfo.submissionChallengeBaseDeposit,
      removalBaseDeposit: viewInfo.removalBaseDeposit,
      removalChallengeBaseDeposit: viewInfo.removalChallengeBaseDeposit,
      arbitrator: viewInfo.arbitrator,
      arbitratorExtraData: viewInfo.arbitratorExtraData,
      arbitrationCost: viewInfo.arbitrationCost,
    }
    return depositParams
  } catch (e) {
    console.log('fetchRegistryDeposits error!', e)
    return undefined
  }
}
