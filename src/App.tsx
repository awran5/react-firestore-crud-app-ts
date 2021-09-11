import React, { useEffect, useState, useRef, useReducer } from 'react'
import { updateDoc, setDoc, doc, Timestamp, collection, deleteDoc, onSnapshot } from 'firebase/firestore'
import { Toast, ToastContainer, Modal, ModalTitle, ModalBody, Table, Card, Button, Form } from 'react-bootstrap'
import ModalHeader from 'react-bootstrap/ModalHeader'

import { firestore, APP_COLLECTION } from './Firebase'
import Loading from './components/Loading'
import Layout from './components/Layout'
import { EditIcon, RemoveIcon, UserIcon } from './components/icons/Svgs'

const formatDate = (date: number) =>
  new Date(date * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

type State = {
  modal: boolean
  users: User[] | undefined
  loading: boolean
  alert: {
    show: boolean
    variant: string
    body: string
  }
}

type Action =
  | { type: 'open-modal' }
  | { type: 'close-modal' }
  | { type: 'reset-alert' }
  | { type: 'create' }
  | { type: 'read'; data: User[] | undefined }
  | { type: 'update' }
  | { type: 'delete' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open-modal':
      return {
        ...state,
        modal: true
      }
    case 'close-modal':
      return {
        ...state,
        modal: false
      }

    case 'create':
      return {
        ...state,
        modal: false,
        alert: {
          show: true,
          variant: 'success',
          body: 'Added Successfully!'
        }
      }

    case 'read':
      return {
        ...state,
        loading: false,
        users: action.data
      }

    case 'update':
      return {
        ...state,
        modal: false,
        alert: {
          show: true,
          variant: 'primary',
          body: 'Modified Successfully!'
        }
      }
    case 'delete':
      return {
        ...state,
        modal: false,
        alert: {
          show: true,
          variant: 'danger',
          body: 'Deleted Successfully!'
        }
      }

    case 'reset-alert':
      return {
        ...state,
        alert: {
          show: false,
          variant: '',
          body: ''
        }
      }
    default:
      return state
  }
}

const initialValues = {
  id: '',
  name: '',
  email: '',
  createdAt: {
    nanoseconds: 0,
    seconds: 0
  },
  updatedAt: {
    nanoseconds: 0,
    seconds: 0
  }
}

type User = typeof initialValues

const App = () => {
  const [{ modal, loading, users, alert }, dispatch] = useReducer(reducer, {
    modal: false,
    loading: true,
    users: undefined,
    alert: {
      show: false,
      variant: '',
      body: ''
    }
  })

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const isUpdate = useRef(false)
  const isRemove = useRef(false)
  const isSubmit = useRef(false)

  // State
  const [formValue, setFormValues] = useState(initialValues)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, APP_COLLECTION), (querySnapshot) => {
      const usersData: any[] = []
      querySnapshot.forEach((document) => {
        usersData.push({
          id: document.id,
          ...document.data()
        })
      })
      dispatch({
        type: 'read',
        data: usersData
      })
    })

    return () => unsubscribe()
  }, [])

  const handleInputFocus = () => inputRef.current && inputRef.current.focus()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target

    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReset = () => {
    if (isUpdate.current) isUpdate.current = false
    if (isRemove.current) isRemove.current = false
    if (isSubmit.current) isSubmit.current = false
    setFormValues(initialValues)
  }

  const handleCreate = async () => {
    const { name, email } = formValue

    await setDoc(doc(collection(firestore, APP_COLLECTION)), {
      name,
      email,
      createdAt: Timestamp.fromDate(new Date())
    })
      .then(() => dispatch({ type: 'create' }))
      .catch((err) => console.log(err))

    setTimeout(() => dispatch({ type: 'reset-alert' }), 2000)
  }

  const handleUpdateClick = (user: User) => {
    dispatch({ type: 'open-modal' })
    isUpdate.current = true
    const { id, name, email } = user
    setFormValues((prev) => ({
      ...prev,
      id,
      name,
      email,
      updatedAt: Timestamp.fromDate(new Date())
    }))
  }

  const handleUpdate = async () => {
    const { id, name, email } = formValue

    await updateDoc(doc(firestore, APP_COLLECTION, id), {
      name,
      email,
      updatedAt: Timestamp.fromDate(new Date())
    })
      .then(() => dispatch({ type: 'update' }))
      .catch((err) => console.log('Error updating document: ', err))

    setTimeout(() => dispatch({ type: 'reset-alert' }), 2000)
  }

  const handleRemoveClick = (user: User) => {
    dispatch({ type: 'open-modal' })
    isRemove.current = true
    const { id } = user
    setFormValues((prev) => ({
      ...prev,
      id
    }))
  }

  const handleRemove = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()

    const { id } = formValue

    await deleteDoc(doc(firestore, APP_COLLECTION, id))
      .then(() => dispatch({ type: 'delete' }))
      .catch((err) => console.log('Error removing document: ', err))

    setTimeout(() => dispatch({ type: 'reset-alert' }), 2000)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    isSubmit.current = true

    if (isUpdate.current) await handleUpdate()
    else await handleCreate()
  }

  if (loading) return <Loading fullwidth />

  return (
    <Layout>
      {users && users.length > 0 ? (
        <>
          <div className='py-3 d-flex justify-content-end'>
            <Button variant='primary' onClick={() => dispatch({ type: 'open-modal' })}>
              <UserIcon className='me-2' />
              Add User
            </Button>
          </div>

          <Table striped bordered hover className='shadow-sm align-middle'>
            <thead>
              <tr>
                <th className='text-center'>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Created</th>
                <th>Modified</th>
                <th className='text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user, index: number) => (
                  <tr key={user.id}>
                    <td className='align-middle text-center'>{index + 1}</td>
                    <td className='align-middle'>{user.name}</td>
                    <td className='align-middle'>{user.email}</td>
                    <td className='align-middle'>{formatDate(user.createdAt.seconds)}</td>
                    <td className='align-middle'>{user.updatedAt ? formatDate(user.updatedAt.seconds) : '-'}</td>
                    <td className='align-middle text-center'>
                      <Button variant='light' onClick={() => handleUpdateClick(user)}>
                        <EditIcon />
                      </Button>
                      <Button variant='light ' className='ms-2' onClick={() => handleRemoveClick(user)}>
                        <RemoveIcon />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </>
      ) : (
        <Card className='shadow-sm'>
          <Card.Header>Add New User</Card.Header>
          <Card.Body>
            <Button variant='primary' onClick={() => dispatch({ type: 'open-modal' })}>
              <UserIcon className='me-2' />
              Add User
            </Button>
          </Card.Body>
        </Card>
      )}

      <Modal
        show={modal}
        onHide={() => dispatch({ type: 'close-modal' })}
        onShow={handleInputFocus}
        onExited={handleReset}
        centered
      >
        <ModalHeader closeButton onClick={() => dispatch({ type: 'close-modal' })}>
          {/* eslint-disable-next-line no-nested-ternary */}
          <ModalTitle>{isRemove.current ? 'Delete User' : isUpdate.current ? 'Edit User' : 'Add New User'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {isSubmit.current ? (
            <Loading fill='#007bff' />
          ) : (
            <Form onSubmit={handleSubmit}>
              {isRemove.current ? (
                <>
                  <div className='h5'>Are you sure you want to delete this user?</div>
                  <div className='text-right mt-4 mb-2'>
                    <Button variant='secondary' onClick={() => dispatch({ type: 'close-modal' })} className='me-2'>
                      Cancel
                    </Button>
                    <Button variant='danger' type='submit' disabled={isSubmit.current} onClick={handleRemove}>
                      Delete
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control value={formValue.name} onChange={handleChange} name='name' required ref={inputRef} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type='email' value={formValue.email} onChange={handleChange} name='email' required />
                  </Form.Group>

                  <div className='text-end mt-4 mb-2'>
                    <Button variant='secondary' onClick={() => dispatch({ type: 'close-modal' })} className='me-2'>
                      Cancel
                    </Button>
                    <Button
                      variant={isUpdate.current ? 'success' : 'primary'}
                      type='submit'
                      disabled={isSubmit.current}
                    >
                      {isUpdate.current ? 'Save' : 'Create'}
                    </Button>
                  </div>
                </>
              )}
            </Form>
          )}
        </ModalBody>
      </Modal>
      <ToastContainer position='bottom-start' className='p-4'>
        <Toast show={alert.show} delay={5000} autohide bg={alert.variant}>
          <Toast.Header>
            <strong className='me-auto'>Action</strong>
          </Toast.Header>
          <Toast.Body style={{ backgroundColor: '#eee' }}>{alert.body}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Layout>
  )
}

export default App
