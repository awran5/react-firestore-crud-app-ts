import React, { createContext } from 'react'
import firebase, { App, Firestore } from './Firebase'

interface ContextProps {
  firebase: typeof firebase
  App: firebase.app.App
  cloudRef: (ref: string) => firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
}

export const AppContext = createContext<ContextProps>({
  firebase,
  App,
  cloudRef: (ref: string) => Firestore.collection(ref),
})

const cloudRef = (ref: string) => Firestore.collection(ref)

interface ProviderProps {
  children: React.ReactNode
}
export default function ContextProvider({ children }: ProviderProps) {
  return <AppContext.Provider value={{ firebase, App, cloudRef }}>{children}</AppContext.Provider>
}
