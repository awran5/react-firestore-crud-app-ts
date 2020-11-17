import React, { useContext, useState, useRef } from 'react'
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

type Users = {
  id: string
  name: string
  email: string
}

const App = () => {
  // Firebase Context
  const { firebase, cloudRef } = useContext(AppContext)
  const query = cloudRef('users').orderBy('createdAt')
  const [users, loading, error] = useCollectionData<Users>(query, { idField: 'id' })
  // Form ref
  const inputRef: React.RefObject<HTMLInputElement> = useRef(null)
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

  /**
   * Add focus to the input when modal opens
   * @see https://react-bootstrap.github.io/components/modal/#modal-props
   */
  const handleShow = () => inputRef.current && inputRef.current.focus()

  /**
   * Form onChange Handler
   * @param event Input Event
   */
  const handleChange = (event: React.ChangeEvent) => {
    const { value, name } = event.target as HTMLInputElement

    setState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  /**
   * Modal Handler
   * @param action Change Modal title and form based on action
   * @param user Users Object
   */
  const handleModal = (action: string, user?: Users) => {
    // Toggle modal
    setModal((prev) => !prev)

    switch (action) {
      case 'create':
        setState({
          id: '',
          name: '',
          email: '',
        })
        break

      case 'update':
        setUpdate(true)

        if (!user) return
        setState({
          id: user.id,
          name: user.name,
          email: user.email,
        })
        break

      case 'remove':
        setRemove(true)

        if (!user) return
        setState((prev) => ({
          ...prev,
          id: user.id,
        }))
        break

      case 'close':
        setModal(false)
        setRemove(false)
        setUpdate(false)
        break

      default:
        break
    }
  }
  /**
   * Alert Handler
   * @param action Change Alert message and style based on action
   */
  const handleAlert = (action: string) => {
    switch (action) {
      case 'create':
        setAlert({
          show: true,
          variant: 'success',
          body: 'Added Successfully!',
        })
        break
      case 'remove':
        setRemove(false)
        setAlert({
          show: true,
          variant: 'danger',
          body: 'Deleted Successfully!',
        })
        break
      case 'update':
        setUpdate(false)
        setAlert({
          show: true,
          variant: 'primary',
          body: 'Modified Successfully!',
        })
        break

      default:
        break
    }
    setTimeout(() => {
      setAlert({
        show: false,
        variant: '',
        body: '',
      })
    }, 3000)
  }
  /**
   * Reset State to the default values
   */
  const handleReset = () => {
    setModal(false)
    setSubmit(false)
    setState({
      id: '',
      name: '',
      email: '',
    })
  }

  /**
   * CRUD OPERATIONS
   */

  const handleCreate = async () => {
    const { name, email } = state

    await cloudRef('users')
      .add({
        name,
        email,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      })
      .then(() => {
        handleAlert('create')
        handleReset()
      })
      .catch((error) => console.log('Error adding document: ', error))
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
      .then(() => {
        handleAlert('update')
        setUpdate(false)
        handleReset()
      })
      .catch((error) => console.log('Error updating document: ', error))
  }

  const handleRemove = async () => {
    const { id } = state

    await cloudRef('users')
      .doc(id)
      .delete()
      .then(() => {
        handleAlert('remove')
        setRemove(false)
        handleReset()
      })
      .catch((error) => console.log('Error removing document: ', error))
  }

  /**
   * Submit Handler
   * @param event Form Submit event
   */
  const handleSubmit = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
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
            <Button variant='primary' onClick={() => handleModal('create')}>
              <FontAwesomeIcon icon={faUserPlus} className='mr-2' />
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
                <th className='text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className='align-middle text-center'>{index + 1}</td>
                  <td className='align-middle'>{user.name}</td>
                  <td className='align-middle'>{user.email}</td>
                  <td className='align-middle text-center'>
                    <Button variant='light' onClick={() => handleModal('update', user)}>
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button variant='light ' className='ml-2' onClick={() => handleModal('remove', user)}>
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
            <Button variant='primary' onClick={() => handleModal('create')}>
              <FontAwesomeIcon icon={faUserPlus} className='mr-2' />
              Add User
            </Button>
          </Card.Body>
        </Card>
      )}

      <Modal show={modal} onHide={() => handleModal('close')} onShow={handleShow}>
        <Modal.Header closeButton onClick={() => handleModal('close')}>
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
                <Button variant='secondary' onClick={() => handleModal('close')} className='mr-2'>
                  Cancel
                </Button>
                <Button
                  variant={isRemove ? 'danger' : isUpdate ? 'success' : 'primary'}
                  type='submit'
                  disabled={isSubmit}
                  onClick={handleSubmit}
                >
                  {isRemove ? 'Delete' : isUpdate ? 'Save' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Layout>
  )
}

export default App
