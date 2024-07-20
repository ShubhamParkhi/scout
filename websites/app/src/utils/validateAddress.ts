import { isAddress } from 'ethers'
import request, { gql } from 'graphql-request'
import { registryMap } from './fetchItems'

export interface Issue {
  address?: {
    severity: 'warn' | 'error';
    message: string;
  };
  domain?: {
    severity: 'warn' | 'error';
    message: string;
  };
  contract?: {
    severity: 'warn' | 'error';
    message: string;
  };
  projectName?: {
    severity: 'warn' | 'error';
    message: string;
  };
  publicNameTag?: {
    severity: 'warn' | 'error';
    message: string;
  };
  link?: {
    severity: 'warn' | 'error';
    message: string;
  };
}

const getDupesInRegistry = async (
  richAddress: string,
  registryAddress: string,
  domain?: string
): Promise<number> => {
  const query = gql`
    query ($registry: String!, $richAddress: String!) {
      litems(
        where: {
          registry: $registry,
          status_in: ["Registered", "ClearingRequested"],
          metadata_ : { key0_contains_nocase: $richAddress,
            ${domain ? `key1_starts_with_nocase: "${domain}"` : ''}
              },
        }
      ) {
        id
      }
    }
  `

  const result = (await request({
    url: 'https://api.studio.thegraph.com/query/61738/legacy-curate-gnosis/version/latest',
    document: query,
    variables: {
      registry: registryAddress,
      richAddress,
    },
  })) as any
  const items = result.litems
  return items.length
}

// null
const getAddressValidationIssue = async (
  chainId: string,
  address: string,
  registry: string,
  domain?: string,
  projectName?: string,
  publicNameTag?: string,
  link?: string
): Promise<Issue | null> => {
  let result: Issue = {};

  // check its an address. we dont check checksum.
  if (!isAddress(address)) {
    result.address = { message: 'Not a valid EVM address', severity: 'error' };
  }
  
  // check its not a dupe.
  const ndupes = await getDupesInRegistry(
    chainId + ':' + address,
    registryMap[registry],
    domain  
  );

  if (ndupes > 0) {
    result.domain = { message: 'Duplicate submission', severity: 'error' };
  }

  if (publicNameTag && publicNameTag?.length > 50) {
    result.publicNameTag = { message: 'Public Name Tag too long (max 50 characters)', severity: 'error' };
  }

  if (projectName && (projectName !== projectName.trim())) {
    result.projectName = { message: 'Project name has leading or trailing whitespace', severity: 'warn' };
  }
  if (publicNameTag && (publicNameTag !== publicNameTag.trim())) {
    result.publicNameTag = { message: 'Public Name Tag has leading or trailing whitespace', severity: 'warn' };
  }

  if (link) {
    const tagRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
    const cdnRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
    
    if (registry === 'Tags' && !tagRegex.test(link)) {
      result.link = { message: 'Invalid website format for Tags. Must start with http(s):// and include a valid domain', severity: 'error' };
    } else if (registry === 'CDN' && !cdnRegex.test(link)) {
      result.link = { message: 'Invalid website format for CDN. Must be a valid domain', severity: 'error' };
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

export default getAddressValidationIssue
