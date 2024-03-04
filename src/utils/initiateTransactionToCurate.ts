import { Contract, BrowserProvider } from 'ethers'
import klerosCurateABI from './abi/kleros-curate-abi.json'
import { DepositParams } from './fetchRegistryDeposits'

export async function initiateTransactionToCurate(
  curateContractAddress: string,
  depositParams: DepositParams,
  ipfsPath: string
): Promise<boolean> {
  try {
    if (!depositParams) {
      throw new Error('depositParams is null')
    }
    // Ensure MetaMask or an equivalent provider is available
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found!')
    }

    // Initialize the provider from MetaMask or any injected Ethereum provider
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Prompt the user to connect their wallet
    await window.ethereum.request({ method: 'eth_requestAccounts' })

    // Create an instance of the contract
    const contract = new Contract(
      curateContractAddress,
      klerosCurateABI,
      signer
    )

    const value =
      depositParams.arbitrationCost + depositParams.submissionBaseDeposit

    // Send the transaction
    const transactionResponse = await contract.addItem(ipfsPath, {
      value,
    })

    console.log('Transaction hash:', transactionResponse.hash)

    // Wait for the transaction to be confirmed
    const receipt = await transactionResponse.wait()
    console.log('Transaction was mined in block', receipt.blockNumber)

    return true
  } catch (error) {
    console.error('Error initiating transaction:', error)
    return false
  }
}
