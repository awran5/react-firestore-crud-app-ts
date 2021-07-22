import React, { createContext } from 'react'
import firebase, { App, Firestore } from './Firebase'

const cloudRef = (ref: string) => Firestore.collection(ref)

interface ContextProps {
  firebase: typeof firebase
  App: firebase.app.App
  cloudRef: (
    // eslint-disable-next-line no-unused-vars
    ref: string
  ) => firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
}

export const AppContext = createContext<ContextProps>({
  firebase,
  App,
  cloudRef
})

interface ProviderProps {
  children: React.ReactNode
}
export default function ContextProvider({ children }: ProviderProps) {
  return (
    <AppContext.Provider value={{ firebase, App, cloudRef }}>
      {children}
    </AppContext.Provider>
  )
}
