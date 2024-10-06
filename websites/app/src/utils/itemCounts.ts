import { gql, request } from 'graphql-request'
import { DepositParams, fetchRegistryDeposits } from './fetchRegistryDeposits'
import { registryMap } from './fetchItems'

export interface RegistryMetadata {
  address: string
  tcrTitle: string
  tcrDescription: string
  policyURI: string
  logoURI: string
}

export interface FocusedRegistry {
  numberOfAbsent: number
  numberOfRegistered: number
  numberOfClearingRequested: number
  numberOfChallengedClearing: number
  numberOfRegistrationRequested: number
  numberOfChallengedRegistrations: number
  metadata: RegistryMetadata
  deposits: DepositParams
}

export interface ItemCounts {
  "Single Tags": FocusedRegistry
  "Tags Queries": FocusedRegistry
  CDN: FocusedRegistry
  Tokens: FocusedRegistry
}

const convertStringFieldsToNumber = (obj: any): any => {
  let result: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      result[key] = convertStringFieldsToNumber(obj[key])
    } else if (typeof obj[key] === 'string') {
      result[key] = Number(obj[key])
    } else {
      result[key] = obj[key]
    }
  }

  return result
}

export const fetchItemCounts = async (): Promise<ItemCounts> => {
  const query = gql`
    {
      "Single Tags": lregistry(id: "${registryMap['Single Tags']}") {
        id
        numberOfAbsent
        numberOfRegistered
        numberOfClearingRequested
        numberOfChallengedClearing
        numberOfRegistrationRequested
        numberOfChallengedRegistrations
        registrationMetaEvidence {
          URI
        }
      }
      "Tags Queries": lregistry(id: "${registryMap['Tags Queries']}") {
        id
        numberOfAbsent
        numberOfRegistered
        numberOfClearingRequested
        numberOfChallengedClearing
        numberOfRegistrationRequested
        numberOfChallengedRegistrations
        registrationMetaEvidence {
          URI
        }
      }
      CDN: lregistry(id: "${registryMap.CDN}") {
        id
        numberOfAbsent
        numberOfRegistered
        numberOfClearingRequested
        numberOfChallengedClearing
        numberOfRegistrationRequested
        numberOfChallengedRegistrations
        registrationMetaEvidence {
          URI
        }
      }
      Tokens: lregistry(id: "${registryMap.Tokens}") {
        id
        numberOfAbsent
        numberOfRegistered
        numberOfClearingRequested
        numberOfChallengedClearing
        numberOfRegistrationRequested
        numberOfChallengedRegistrations
        registrationMetaEvidence {
          URI
        }
      }
    }
  `

  const result = (await request({
    url: 'https://api.studio.thegraph.com/query/61738/legacy-curate-gnosis/version/latest',
    document: query,
  })) as any
  const itemCounts: ItemCounts = convertStringFieldsToNumber(result)

  // inject metadata into the uncomplete "ItemCounts". hacky code
  const regMEs = await Promise.all([
    fetch(
      'https://cdn.kleros.link' + result?.["Single Tags"]?.registrationMetaEvidence?.URI
    ).then((r) => r.json()),
    fetch(
      'https://cdn.kleros.link' + result?.["Tags Queries"]?.registrationMetaEvidence?.URI
    ).then((r) => r.json()),
    fetch(
      'https://cdn.kleros.link' + result?.CDN?.registrationMetaEvidence?.URI
    ).then((r) => r.json()),
    fetch(
      'https://cdn.kleros.link' + result?.Tokens?.registrationMetaEvidence?.URI
    ).then((r) => r.json()),
  ])
  itemCounts['Single Tags'].metadata = {
    address: result?.["Single Tags"]?.id,
    policyURI: regMEs[0].fileURI,
    logoURI: regMEs[0].metadata.logoURI,
    tcrTitle: regMEs[0].metadata.tcrTitle,
    tcrDescription: regMEs[0].metadata.tcrDescription,
  }
  itemCounts['Tags Queries'].metadata = {
    address: result?.["Tags Queries"]?.id,
    policyURI: regMEs[0].fileURI,
    logoURI: regMEs[0].metadata.logoURI,
    tcrTitle: regMEs[0].metadata.tcrTitle,
    tcrDescription: regMEs[0].metadata.tcrDescription,
  }
  itemCounts.CDN.metadata = {
    address: result?.CDN?.id,
    policyURI: regMEs[1].fileURI,
    logoURI: regMEs[1].metadata.logoURI,
    tcrTitle: regMEs[1].metadata.tcrTitle,
    tcrDescription: regMEs[1].metadata.tcrDescription,
  }
  itemCounts.Tokens.metadata = {
    address: result?.Tokens?.id,
    policyURI: regMEs[2].fileURI,
    logoURI: regMEs[2].metadata.logoURI,
    tcrTitle: regMEs[2].metadata.tcrTitle,
    tcrDescription: regMEs[2].metadata.tcrDescription,
  }
  // inject registry deposits as well
  const regDs = await Promise.all([
    fetchRegistryDeposits(registryMap['Single Tags']),
    fetchRegistryDeposits(registryMap['Tags Queries']),
    fetchRegistryDeposits(registryMap.CDN),
    fetchRegistryDeposits(registryMap.Tokens),
  ])
  itemCounts['Single Tags'].deposits = regDs[0] as DepositParams
  itemCounts['Tags Queries'].deposits = regDs[0] as DepositParams
  itemCounts.CDN.deposits = regDs[1] as DepositParams
  itemCounts.Tokens.deposits = regDs[2] as DepositParams

  return itemCounts
}
