import pluralize from 'pluralize'
import React, { useMemo } from 'react'
import { createSelector } from 'reselect'

const CREATION = "creation"
const MODIFICATION = "modification"


const getId = (modification, nameId, pathname) => {
  if (nameId) return nameId
  const chunks = pathname.split('/')
  if (modification === MODIFICATION) return chunks.slice(-2)[0]
  return chunks.slice(-1)[0]
}


const getCollectionName = (modification, name, pathname) => {
  if (name) return pluralize(name, 2)
  const chunks = pathname.split('/')
  if (modification === MODIFICATION) return chunks.slice(-3)[0]
  return chunks.slice(-2)[0]
}


export default (location, match, name) => {
  const { pathname, search } = location
  const { params } = match
  const { modification } = params
  const nameId = name && params[`${name}Id`]
  const id = useMemo(() =>
    getId(modification, nameId, pathname), [modification, nameId, pathname])

  const collectionName = useMemo(() =>
    getCollectionName(modification, name, pathname), [modification, name, pathname])

  const isCreatedEntity = id === CREATION
  const isModifiedEntity = modification === MODIFICATION

  const readOnly = !isCreatedEntity && !isModifiedEntity
  let apiPath
  let creationUrl
  let modificationUrl
  let getReadOnlyUrl

  let method
  if (isCreatedEntity) {
    apiPath = `/${collectionName}`
    creationUrl = `${pathname}${search}`
    method = "POST"
    getReadOnlyUrl = createdId => `${pathname.replace(`/${CREATION}`, `/${createdId}`)}${search}`
  } else if (isModifiedEntity) {
    apiPath = `/${collectionName}/${id}`
    creationUrl = `${pathname.replace(`/${id}/${MODIFICATION}`, '')}/${CREATION}${search}`
    method = "PATCH"
    modificationUrl = `${pathname}${search}`
    getReadOnlyUrl = () => `${pathname.replace(`/${MODIFICATION}`, "")}${search}`
  } else if (id) {
    apiPath = `/${collectionName}/${id}`
    creationUrl = `${pathname.replace(`/${id}`, '')}/${CREATION}${search}`
    modificationUrl = `${pathname}/${MODIFICATION}${search}`
    getReadOnlyUrl = () => `${pathname}${search}`
  } else {
    creationUrl = `${pathname}/${CREATION}${search}`
    modificationUrl = `${pathname}/${MODIFICATION}${search}`
    getReadOnlyUrl = () => `${pathname}${search}`
  }

  return {
    apiPath,
    creationUrl,
    getReadOnlyUrl,
    id,
    isCreatedEntity,
    isModifiedEntity,
    method,
    modificationUrl,
    name: name || pluralize(collectionName, 1),
    readOnly
  }
}
