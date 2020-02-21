# with-react-formidable

A small wrapper parsing react-router location and match to provide helpful form contextual properties.

[![CircleCI](https://circleci.com/gh/betagouv/with-react-formidable/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/with-react-formidable/tree/master)
[![npm version](https://img.shields.io/npm/v/with-react-formidable.svg?style=flat-square)](https://npmjs.org/package/with-react-formidable)


## Convention

Your app needs to work with a special react-router pathname syntax. Given the url, withFormidable will find by itself if you are in readOnly, creation or modification state. Render your component with its Route config:

```javascript
  <Route
    component={Foo}
    path='/foos/:fooId([A-Za-z0-9]{2,}|creation)/:modification(modification)?'
  />
```

Then :
  - `/foos/AE` is a readOnly url, for the specific fetch of the entity foo with id=AE,
  - `/foos/creation` is the creation url for posting a new foo object,
  - `/foos/AE/modification` is the modification url for patching an already existing foo entity with id AE.

## Basic usage with react-final-form and redux-thunk-data

Make your app starting at `location.pathname="/foos/AE"`.

### react old school

```javascript
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field, Form } from 'react-final-form'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { requestData } from 'redux-thunk-data'
import withFormidable from 'with-react-formidable'

class Foo extends PureComponent {

  componentDidMount() {
    const { form, handleRequestFoo } = this.props
    const { apiPath, isCreatedEntity } = form
    if (!isCreatedEntity) {
      handleRequestFoo({ apiPath })
    }
  }

  handleActivateForm = () => {
    const { form, history } = this.props
    const { modificationUrl } = form
    history.push(modificationUrl)
  }

  handleDeactivateForm = formResolver => (state, action) => {
    const { payload } = action
    const { datum } = payload
    const { id: createdId } = datum
    const { form, history } = this.props
    const { getReadOnlyUrl } = form
    formResolver()
    history.push(getReadOnlyUrl(createdId))
  }

  handleFormSubmit = formValues => {
    const { form, handleSubmitFoo } = this.props
    const { apiPath, method } = form
    const formSubmitPromise = new Promise(resolve => {
      handleSubmitFoo({
        apiPath,
        body: { ...formValues },
        handleSuccess: this.handleDeactivateForm(resolve),
        method
      })
    })
    return formSubmitPromise
  }

  renderField = ({ input }) => {
    const { form } = this.props
    const { readOnly } = form
    return (
      <input
        {...input}
        readOnly={readOnly}
        type="text"
      />
    )
  }

  renderForm = ({ handleSubmit }) => {
    const { form } = this.props
    const { readOnly } = form
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="title"
          render={this.renderField}
        />
        {
          readOnly
          ? (
            <button
              onClick={this.handleActivateForm}
              type="button"
            >
              {'Modify'}
            </button>
          )
          : (
            <button type="submit">
              {'Save'}
            </button>
          )
        }
      </form>
    )
  }

  render () {
    const { form } = this.props
    const { readOnly } = form
    return (
      <Form
        initialValues={initialValues}
        onSubmit={this.onFormSubmit}
        render={this.renderForm}
      />
    )
  }
}

Foo.propTypes = {
  form: PropTypes.shape({
    apiPath: PropTypes.string,
    getReadOnlyUrl: PropTypes.func,
    isCreatedEntity: PropTypes.bool,
    method: PropTypes.string,
    modificationUrl: PropTypes.string,
    readOnly: PropTypes.bool
  }).isRequired,
}

const mapDispatchProps = (dispatch, ownProps) => ({
  handleRequestFoo: config => dispatch(requestData(config)),
  handleSubmitFoo: config => dispatch(requestData(config))
})

export default compose(
  withRouter,
  withFormidable,
  connect(null, mapDispatchProps)
)(Foo)
```

### react hooks school

```javascript
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Field, Form } from 'react-final-form'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { requestData } from 'redux-thunk-data'
import { useFormidable } from 'with-react-formidable'

const Field = ({ input, readOnly }) => {
  const location = useLocation()
  const params = useParams()
  const { readOnly } = useFormidable(location, params)
  return (
    <input
      {...input}
      readOnly={readOnly}
      type="text"
    />
  )
}

const FooForm = ({ handleSubmit, modificationUrl, readOnly }) => {
  const history = useHistory()
  const location = useLocation()
  const params = useParams()
  const { modificationUrl, readOnly } = useFormidable(location, params)

  const handleActivateForm = useCallback(() => {
    history.push(modificationUrl)
  }, [history, modificationUrl])

  const renderField = useCallback(props =>
    <Field readOnly={readOnly} {...props} />, [readOnly])

  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="title"
        render={renderField}
      />
      {
        readOnly
        ? (
          <button
            onClick={handleActivateForm}
            type="button"
          >
            {'Modify'}
          </button>
        )
        : (
          <button type="submit">
            {'Save'}
          </button>
        )
      }
    </form>
  )
}


const Foo = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  const params = useParams()
  const {
    apiPath,
    isCreatedEntity,
    getReadOnlyUrl,
    method,
    readOnly
  } = useFormidable(location, params)


  const handleFormSubmit = useCallback(formValues => {
    const formSubmitPromise = new Promise(resolve => {
      dispatch(requestData({
        apiPath,
        body: { ...formValues },
        handleSuccess: (state, action) => {
          const { payload } = action
          const { datum } = payload
          const { id: createdId } = datum
          resolve()
          history.push(getReadOnlyUrl(createdId))
        },
        method
      })})
    return formSubmitPromise
  }, [apiPath, dispatch, getReadOnlyUrl, history, method])


  useEffet(() => {
    if (isCreatedEntity) dispatch(requestData({ apiPath }))
  }, [apiPath, dispatch, isCreatedEntity])


  return (
    <Form
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      render={FooForm}
    />
  )
}

export default Foo
```
