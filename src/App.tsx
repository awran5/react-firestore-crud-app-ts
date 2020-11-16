import React, { useContext, useState, useRef, useEffect } from 'react'
import { AppContext } from './Context'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import Layout from './components/Layout'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Loading from './components/Loading'
import Alert from 'react-bootstrap/Alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'

interface State {
  id: string
  name: string
  email: string
}

const App = () => {
  // Firebase
  const { firebase, cloudRef } = useContext(AppContext)
  const query = cloudRef('users').orderBy('createdAt')
  const [users, loading, error] = useCollectionData(query, { idField: 'id' })
  // State
  const [modal, setModal] = useState(false)
  const [isUpdate, setUpdate] = useState(false)
  const [isRemove, setRemove] = useState(false)
  const [isSubmit, setSubmit] = useState(false)
  const [state, setState] = useState({
    id: '',
    name: '',
    email: '',
  })
  const [alert, setAlert] = useState({
    show: false,
    variant: '',
    body: '',
  })
  // Form ref
  const inputRef: React.RefObject<HTMLInputElement> = useRef(null)

  // Add focus to the input when modal opens
  useEffect(() => {
    if (modal && inputRef.current) inputRef.current.focus()
  }, [modal])

  // State functions
  const resetState = () => {
    setModal(false)
    setUpdate(false)
    setRemove(false)
    setSubmit(false)
    setState({
      id: '',
      name: '',
      email: '',
    })
    setTimeout(() => {
      setAlert({
        show: false,
        variant: '',
        body: '',
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement

    setState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleModal = () => {
    setModal((prev) => !prev)

    if (isUpdate || isRemove) {
      setState({
        id: '',
        name: '',
        email: '',
      })
      setUpdate(false)
      setRemove(false)
    }
  }

  const handleUpdateModal = ({ id, name, email }: State) => {
    setModal(true)
    setUpdate(true)
    setState({
      id,
      name,
      email,
    })
  }

  const handleRemoveModal = (id: string) => {
    setModal(true)
    setRemove(true)
    setState((prev) => ({
      ...prev,
      id,
    }))
  }

  const handleDone = (action: string) => {
    const variant = action === 'remove' ? 'danger' : action === 'update' ? 'primary' : 'success'
    setAlert({
      show: true,
      variant,
      body: `${action === 'remove' ? 'Deleted' : action === 'update' ? 'Modified' : 'Added'} Successfully!`,
    })
    resetState()
  }

  // CRUD operations
  const handleRemove = async () => {
    const { id } = state

    await cloudRef('users')
      .doc(id)
      .delete()
      .then(() => handleDone('remove'))
      .catch((error) => console.log('Error removing document: ', error))
  }

  const handleUpdate = async () => {
    const { id, name, email } = state

    await cloudRef('users')
      .doc(id)
      .update({
        name,
        email,
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
      })
      .then(() => handleDone('update'))
      .catch((error) => console.log('Error updating document: ', error))
  }

  const handleCreate = async () => {
    const { name, email } = state

    await cloudRef('users')
      .add({
        name,
        email,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      })
      .then(() => handleDone('create'))
      .catch((error) => console.log('Error adding document: ', error))
  }
  // Submit
  const handleSubmit = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setSubmit(true)

    if (isUpdate) handleUpdate()
    else if (isRemove) handleRemove()
    else handleCreate()
  }

  if (error) return <h1> Error: {error}</h1>
  if (loading) return <Loading fullwidth />
  return (
    <Layout>
      {users && users.length > 0 ? (
        <>
          <div className='py-3 d-flex justify-content-end'>
            <Button variant='primary' onClick={handleModal}>
              <FontAwesomeIcon icon={faUserPlus} className='mr-2' />
              Add User
            </Button>
          </div>
          <Table striped bordered hover className='shadow-sm align-middle'>
            <thead>
              <tr>
                <th className='text-center'>#</th>
                <th>Name</th>
                <th>Email</th>
                <th className='text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user: any, index) => (
                  <tr key={user.id}>
                    <td className='align-middle text-center'>{index + 1}</td>
                    <td className='align-middle'>{user.name}</td>
                    <td className='align-middle'>{user.email}</td>
                    <td className='align-middle text-center'>
                      <Button variant='light' onClick={() => handleUpdateModal(user)}>
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </Button>
                      <Button variant='light ' className='ml-2' onClick={() => handleRemoveModal(user.id)}>
                        <FontAwesomeIcon icon={faTrashAlt} />
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
            <Button variant='primary' onClick={handleModal}>
              <FontAwesomeIcon icon={faUserPlus} className='mr-2' />
              Add User
            </Button>
          </Card.Body>
        </Card>
      )}

      <Modal show={modal} centered>
        <Modal.Header closeButton onClick={handleModal}>
          <Modal.Title>{isRemove ? 'Delete User' : isUpdate ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {isSubmit ? (
            <Loading fill='#007bff' />
          ) : (
            <Form>
              {isRemove ? (
                <div className='h5'>Are you sure you want to delete this user?</div>
              ) : (
                <React.Fragment>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={state.name || ''}
                      onChange={handleChange}
                      name='name'
                      required
                      ref={inputRef}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type='email'
                      value={state.email || ''}
                      onChange={handleChange}
                      name='email'
                      required
                    />
                  </Form.Group>
                </React.Fragment>
              )}
              <div className='text-right mt-4 mb-2'>
                <Button variant='secondary' onClick={handleModal} className='mr-2'>
                  Cancel
                </Button>
                <Button
                  variant={isRemove ? 'danger' : isUpdate ? 'success' : 'primary'}
                  type='submit'
                  disabled={isSubmit}
                  onClick={handleSubmit}
                >
                  {isRemove ? 'Delete' : isUpdate ? 'Save' : 'Add'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <Alert show={alert.show} variant={alert.variant} className='shadow-sm'>
        {alert.body}
      </Alert>
    </Layout>
  )
}

export default App
