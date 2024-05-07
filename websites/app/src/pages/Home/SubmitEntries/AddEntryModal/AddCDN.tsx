import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatEther } from 'ethers'
import getAddressValidationIssue from 'utils/validateAddress'
import ipfsPublish from 'utils/ipfsPublish'
import { getIPFSPath } from 'utils/getIPFSPath'
import { initiateTransactionToCurate } from 'utils/initiateTransactionToCurate'
import { fetchItemCounts } from 'utils/itemCounts'
import { DepositParams } from 'utils/fetchRegistryDeposits'
import RichAddressForm, { NetworkOption } from './RichAddressForm'
import ImageUpload from './ImageUpload'
import { ClosedButtonContainer } from 'pages/Home'
import {
  AddContainer,
  AddHeader,
  AddSubtitle,
  AddTitle,
  CloseButton,
  ErrorMessage,
  StyledGoogleFormAnchor,
  StyledTextInput,
  SubmitButton,
} from './index'

const columns = [
  {
    label: 'Contract address',
    description:
      'The address of the contract in question. Case-sensitive only if required by the blockchain that the address pertains to (e.g. Solana). ',
    type: 'rich address',
    isIdentifier: true,
  },
  {
    label: 'Domain name',
    description:
      'The specific (sub)domain name of the dApp where this contract is meant to be accessed from.  Wildcards (*) are acceptable as part of this field if proof can be shown that the contract is intended to be used across multiple domains.',
    type: 'text',
    isIdentifier: true,
  },
  {
    label: 'Visual proof',
    description:
      'If the domain is a specific root or subdomain, this must be a screenshot of the exact page and setup where this particular address can be interacted from.',
    type: 'image',
    isIdentifier: false,
  },
]

const AddCDN: React.FC = () => {
  const [network, setNetwork] = useState<NetworkOption>({
    value: 'eip155:1',
    label: 'Mainnet',
  })
  const [address, setAddress] = useState<string>('')
  const [path, setPath] = useState<string>('')
  const {
    isLoading: countsLoading,
    error: countsError,
    data: countsData,
  } = useQuery({
    queryKey: ['counts'],
    queryFn: () => fetchItemCounts(),
    staleTime: Infinity,
  })

  const { isLoading: addressIssuesLoading, data: addressIssuesData } = useQuery(
    {
      queryKey: ['addressissues', network.value + ':' + address, 'CDN', '-'],
      queryFn: () => getAddressValidationIssue(network.value, address, 'CDN'),
    }
  )

  const [domain, setDomain] = useState<string>('')

  const submitCDN = async () => {
    const values = {
      'Contract address': `${network.value}:${address}`,
      'Domain name': domain,
      'Visual proof': path,
    }
    const item = {
      columns,
      values,
    }
    const enc = new TextEncoder()
    const fileData = enc.encode(JSON.stringify(item))
    const ipfsURL = getIPFSPath(await ipfsPublish('item.json', fileData))
    await initiateTransactionToCurate(
      '0x957a53a994860be4750810131d9c876b2f52d6e1',
      countsData?.CDN.deposits as DepositParams,
      ipfsURL
    )
  }

  const submittingDisabled =
    !address ||
    !domain ||
    !!addressIssuesData ||
    !!addressIssuesLoading ||
    !path

  return (
    <AddContainer>
      <AddHeader>
        <div>
          <AddTitle>Submit CDN</AddTitle>
          <AddSubtitle>
            Want to suggest an entry without any deposit?{' '}
            <StyledGoogleFormAnchor
              target="_blank"
              href="https://docs.google.com/forms/d/e/1FAIpQLSeO32UBCpIYu3XIKGM-hLqWu51XcsSG1QRxtuycZPyS9mMtVg/viewform"
            >
              Click here
            </StyledGoogleFormAnchor>
          </AddSubtitle>
        </div>
        <ClosedButtonContainer>
          <CloseButton />
        </ClosedButtonContainer>
      </AddHeader>
      <RichAddressForm
        networkOption={network}
        setNetwork={setNetwork}
        address={address}
        setAddress={setAddress}
        registry="Tags"
      />
      {addressIssuesLoading && 'Loading'}
      {addressIssuesData && (
        <ErrorMessage>{addressIssuesData.message}</ErrorMessage>
      )}
      Domain
      <StyledTextInput
        placeholder="domain"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
      <ImageUpload path={path} setPath={setPath} />
      <SubmitButton disabled={submittingDisabled} onClick={submitCDN}>
        Submit -{' '}
        {countsData?.CDN?.deposits
          ? formatEther(
              countsData.CDN.deposits.arbitrationCost +
                countsData.CDN.deposits.submissionBaseDeposit
            ) + ' xDAI'
          : null}
      </SubmitButton>
    </AddContainer>
  )
}

export default AddCDN
