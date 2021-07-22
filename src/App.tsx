/* eslint-disable no-nested-ternary */
import React, { useContext, useState, useRef, useEffect } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalTitle from 'react-bootstrap/ModalTitle'
import ModalBody from 'react-bootstrap/ModalBody'
import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Loading from './components/Loading'
import Layout from './components/Layout'
import { AppContext } from './Context'

import { EditIcon, RemoveIcon, UserIcon } from './components/icons/Svgs'

const formatDate = (date: number) =>
  new Date(date * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric'
  })

type User = {
  id: string
  name: string
  email: string
  createdAt: {
    nanoseconds: number
    seconds: number
  }
  updatedAt: {
    nanoseconds: number
    seconds: number
  }
}

const initialValues: User = {
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
const initialAlert = {
  show: false,
  variant: '',
  body: ''
}

const App = () => {
  // Firebase Context
  const { firebase, cloudRef } = useContext(AppContext)
  const query = cloudRef('users').orderBy('createdAt')
  const [users, loading, error] = useCollectionData<User>(query, {
    idField: 'id'
  })
  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const isUpdate = useRef(false)
  const isRemove = useRef(false)
  const isSubmit = useRef(false)

  // State
  const [modal, setModal] = useState(false)

  const [formValue, setFormValues] = useState(initialValues)
  const [alert, setAlert] = useState(initialAlert)

  const handleInputFocus = () => inputRef.current && inputRef.current.focus()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target

    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    if (users) {
      users.map((user) => {
        console.log(user)
        return ''
      })
    }
  }, [users])

  const handleUpdateValues = (user: User) => {
    setModal(true)
    isUpdate.current = true
    const { id, name, email } = user
    setFormValues((prev) => ({
      ...prev,
      id,
      name,
      email
    }))
  }

  const handleRemoveValues = (user: User) => {
    setModal(true)
    isRemove.current = true
    const { id } = user
    setFormValues((prev) => ({
      ...prev,
      id
    }))
  }

  const handleOpenModal = () => setModal(true)
  const handleCloseModal = () => setModal(false)

  const handleAlert = (action: string) => {
    switch (action) {
      case 'create':
        setAlert({
          show: true,
          variant: 'success',
          body: 'Added Successfully!'
        })
        break
      case 'remove':
        setAlert({
          show: true,
          variant: 'danger',
          body: 'Deleted Successfully!'
        })
        break
      case 'update':
        setAlert({
          show: true,
          variant: 'primary',
          body: 'Modified Successfully!'
        })
        break

      default:
        break
    }
    setTimeout(() => setAlert(initialAlert), 3000)
  }

  const handleReset = () => {
    if (isUpdate.current) isUpdate.current = false
    if (isRemove.current) isRemove.current = false
    if (isSubmit.current) isSubmit.current = false
    setFormValues(initialValues)
  }

  const handleCreate = async () => {
    const { name, email } = formValue

    await cloudRef('users')
      .add({
        name,
        email,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      })
      .then(() => {
        handleCloseModal()
        handleAlert('create')
      })
      .catch((err) => console.log('Error adding document: ', err))
  }

  const handleUpdate = async () => {
    const { id, name, email } = formValue

    await cloudRef('users')
      .doc(id)
      .update({
        name,
        email,
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
      })
      .then(() => {
        handleCloseModal()
        handleAlert('update')
      })
      .catch((err) => console.log('Error updating document: ', err))
  }

  const handleRemove = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()

    const { id } = formValue
    await cloudRef('users')
      .doc(id)
      .delete()
      .then(() => {
        handleCloseModal()
        handleAlert('remove')
      })
      .catch((err) => console.log('Error removing document: ', err))
  }

  const handleSubmit = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    isSubmit.current = true

    if (isUpdate.current) await handleUpdate()
    else await handleCreate()
  }

  if (error) return <h1> Error: {error}</h1>
  if (loading) return <Loading fullwidth />
  return (
    <Layout>
      {users && users.length > 0 ? (
        <>
          <div className='py-3 d-flex justify-content-end'>
            <Button variant='primary' onClick={handleOpenModal}>
              <UserIcon className='me-2' />
              Add User
            </Button>
          </div>
          <Alert show={alert.show} variant={alert.variant} className='shadow-sm'>
            {alert.body}
          </Alert>
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
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className='align-middle text-center'>{index + 1}</td>
                  <td className='align-middle'>{user.name}</td>
                  <td className='align-middle'>{user.email}</td>
                  <td className='align-middle'>{formatDate(user.createdAt.seconds)}</td>
                  <td className='align-middle'>{user.updatedAt ? formatDate(user.updatedAt.seconds) : '-'}</td>
                  <td className='align-middle text-center'>
                    <Button variant='light' onClick={() => handleUpdateValues(user)}>
                      <EditIcon />
                    </Button>
                    <Button variant='light ' className='ms-2' onClick={() => handleRemoveValues(user)}>
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
            <Button variant='primary' onClick={handleOpenModal}>
              <UserIcon className='me-2' />
              Add User
            </Button>
          </Card.Body>
        </Card>
      )}

      <Modal show={modal} onHide={handleCloseModal} onShow={handleInputFocus} onExited={handleReset} centered>
        <ModalHeader closeButton onClick={handleCloseModal}>
          <ModalTitle>{isRemove.current ? 'Delete User' : isUpdate.current ? 'Edit User' : 'Add New User'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {isSubmit.current ? (
            <Loading fill='#007bff' />
          ) : (
            <Form>
              {isRemove.current ? (
                <>
                  <div className='h5'>Are you sure you want to delete this user?</div>
                  <div className='text-right mt-4 mb-2'>
                    <Button variant='secondary' onClick={handleCloseModal} className='me-2'>
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

                  <div className='text-right mt-4 mb-2'>
                    <Button variant='secondary' onClick={handleCloseModal} className='me-2'>
                      Cancel
                    </Button>
                    <Button
                      variant={isUpdate.current ? 'success' : 'primary'}
                      type='submit'
                      disabled={isSubmit.current}
                      onClick={handleSubmit}
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
    </Layout>
  )
}

export default App
