import { useEffect, useReducer, useMemo } from 'react'
import { Firestore, collection, onSnapshot, DocumentData, Query, SnapshotListenOptions } from 'firebase/firestore'

// type DataSnapshot = DocumentData | null

type State = {
  loading: boolean
  error: string
  data: any[]
}

type Action = { type: 'snapshot'; data: any[] } | { type: 'error'; err: string }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'snapshot':
      return {
        ...state,
        loading: false,
        data: action.data
      }
    case 'error':
      return {
        ...state,
        loading: false,
        error: action.err
      }

    default:
      return state
  }
}

/**
 * Gets a `CollectionReference` instance that refers to the collection at
 * the specified absolute path.
 *
 * @param firestore A reference to the root `Firestore` instance.
 * @param path  A slash-separated path to a collection.
 * @param pathSegments - Additional path segments to apply relative to the first
 * @param includeMetadataChanges - Include a change even if only the metadata of the query or of a document changed. Default is false.
 * @returns The `CollectionReference` instance.
 *
 */
export function useCollection(
  firestore: Firestore,
  path: string,
  pathSegments: string = '',
  includeMetadataChanges: boolean = false
): [boolean, string, any[]] {
  const [{ loading, error, data }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    data: []
  })

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, path, pathSegments), (querySnapshot) => {
      const users: any[] = []
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        })
      })
      dispatch({
        type: 'snapshot',
        data: users
      })
    })

    return () => unsubscribe()
  }, [firestore, path, pathSegments, includeMetadataChanges])

  return useMemo(() => [loading, error, data], [loading, error, data])
}
