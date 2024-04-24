import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { landscapeStyle } from 'styles/landscapeStyle'
import Skeleton from 'react-loading-skeleton'
import { useSearchParams } from 'react-router-dom'
import { formatEther } from 'ethers'
import { GraphItem, Prop, registryMap } from 'utils/fetchItems'
import AddressDisplay from 'components/AddressDisplay'

const Card = styled.div`
  background-color: #3a2154;
  border-radius: 12px;
  color: white;
  font-family: 'Oxanium', sans-serif;
  width: 84vw;
  box-sizing: border-box;

  ${landscapeStyle(
    () => css`
      width: auto;
    `
  )}
`

const CardStatus = styled.div<{ status: string }>`
  text-align: center;
  font-weight: bold;
  padding-top: 20px;
  padding-bottom: 15px;
  margin-bottom: 10px;
  border-bottom: 3px solid #08020e;

  &:before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-bottom: 0px;
    background-color: ${({ status }) =>
      ({
        Registered: '#90EE90',
        Submitted: '#FFEA00',
        'Challenged Submission': '#E87B35',
        'Challenged Removal': '#E87B35',
        Removed: 'red',
      }[status] || 'gray')};
    border-radius: 50%;
    margin-right: 10px;
  }
`

const CardContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
  padding-bottom: 20px;
  align-items: center;
`

const ImageWrapper = styled.div`
  display: flex;
  height: 108px;
  justify-content: center;
`

const Image = styled.img<{ isFullWidth: boolean }>`
  height: 100px;
  ${({ isFullWidth }) => isFullWidth && 'width: 100%; height: 100%;'}
`

const DetailsButton = styled.button`
  background-color: #3a2154;
  font-family: 'Oxanium', sans-serif;
  border-radius: 8px;
  border: 2px solid #fff;
  color: #fff;
  cursor: pointer;
  width: 140px;
  height: 32px;
  font-size: 16px;
  transition: transform 100ms ease-in-out, box-shadow 150ms ease-in-out;

  &:active {
    transform: scale(0.97);
  }
`

interface IEntry {
  item: GraphItem
}

interface IStatus {
  status:
    | 'Registered'
    | 'Absent'
    | 'RegistrationRequested'
    | 'ClearingRequested'
  disputed: boolean
  bounty: string
}

const Status: React.FC<IStatus> = ({ status, disputed, bounty }) => {
  const readableStatusMap = {
    Registered: 'Registered',
    Absent: 'Removed',
    RegistrationRequested: 'Submitted',
    ClearingRequested: 'Removing',
  }
  const challengedStatusMap = {
    RegistrationRequested: 'Challenged Submission',
    ClearingRequested: 'Challenged Removal',
  }
  const label = disputed
    ? challengedStatusMap[status]
    : readableStatusMap[status]

  const readableBounty =
    (status === 'ClearingRequested' || status === 'RegistrationRequested') &&
    !disputed
      ? Number(formatEther(bounty))
      : null

  return (
    <CardStatus status={label}>
      {label}
      {readableBounty ? ' — ' + readableBounty + ' xDAI' : ''}
    </CardStatus>
  )
}

const Entry: React.FC<IEntry> = ({ item }) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [, setSearchParams] = useSearchParams()

  const handleEntryDetailsClick = () => {
    setSearchParams((prev) => {
      const prevParams = prev.toString()
      const newParams = new URLSearchParams(prevParams)
      newParams.append('itemdetails', item.id)
      return newParams
    })
  }

  return (
    <Card>
      <Status
        status={item.status}
        disputed={item.disputed}
        bounty={item.requests[0].deposit}
      />
      <CardContent>
        <strong>
          <AddressDisplay address={item.key0} />
        </strong>
        {item.registryAddress === registryMap['Tags'] && (
          <>
            <div>{item.key2}</div>
            <div>{item.key1}</div>
            <div>{item.key3}</div>
          </>
        )}
        {item.registryAddress === registryMap['Tokens'] && (
          <>
            {item.props && item.props.find((prop) => prop.label === 'Logo') && (
              <ImageWrapper>
                {!imgLoaded && <Skeleton height={100} width={100} />}
                <Image
                  src={`https://ipfs.kleros.io/${
                    (item.props.find((prop) => prop.label === 'Logo') as Prop)
                      .value
                  }`}
                  alt="Logo"
                  isFullWidth={false}
                  onLoad={() => setImgLoaded(true)}
                  style={{ display: imgLoaded ? 'block' : 'none' }}
                />
              </ImageWrapper>
            )}
            <div>{item.key2}</div>
            <div>{item.key1}</div>
          </>
        )}
        {item.registryAddress === registryMap['CDN'] && (
          <>
            <div>{item.key1}</div>
          </>
        )}
        <DetailsButton
          onClick={() => {
            handleEntryDetailsClick()
          }}
        >
          Details
        </DetailsButton>
      </CardContent>
    </Card>
  )
}

export default Entry
