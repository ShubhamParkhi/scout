import React from 'react'
import styled, { css } from 'styled-components'
import { landscapeStyle } from 'styles/landscapeStyle'
import { GraphItem } from 'utils/fetchItems'
import Entry from './Entry'
import { ITEMS_PER_PAGE } from 'pages/Home'

const EntriesContainer = styled.div`
  width: 80%;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px 40px;
  justify-content: center;

  ${landscapeStyle(
    () => css`
      grid-template-columns: repeat(4, 1fr);
    `
  )}
`

interface IEntriesList {
  searchData: GraphItem[]
}

const EntriesList: React.FC<IEntriesList> = ({ searchData }) => {
  return (
    <EntriesContainer>
      {searchData.slice(0, ITEMS_PER_PAGE).map((item) => (
        <Entry key={item.id} item={item} />
      ))}
    </EntriesContainer>
  )
}

export default EntriesList
