import 'babel-polyfill'
import { mount } from "enzyme"
import { createBrowserHistory } from 'history'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { act } from 'react-dom/test-utils';
import { Field, Form } from 'react-final-form'
import { connect, Provider } from 'react-redux'
import { Route, Router, withRouter } from 'react-router-dom'
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { createDataReducer, requestData } from 'redux-thunk-data'

import withFormidable from '../withFormidable'

const foo = { id: "AE", title: "Jean-Michel" }
global.fetch = (url, config) => {
  const { body, method } = config
  if (method === "GET") {
    return {
      json: () => foo,
      status: 200
    }
  }
  if (method === "PATCH") {
    return {
      json: () => ({ ...foo, ...JSON.parse(body) }),
      status: 200
    }
  }
}

const storeEnhancer = applyMiddleware(
  thunk.withExtraArgument()
)
const rootReducer = combineReducers({ data: createDataReducer({ foos: [] }) })

class Foo extends PureComponent {

  componentDidMount() {
    const { formidable, handleRequestFoo } = this.props
    const { apiPath, isCreatedEntity } = formidable
    if (!isCreatedEntity) {
      handleRequestFoo({ apiPath })
    }
  }

  handleActivateForm = () => {
    const { formidable, history } = this.props
    const { modificationUrl } = formidable
    history.push(modificationUrl)
  }

  handleDeactivateForm = formResolver => (state, action) => {
    const { payload } = action
    const { datum } = payload
    const { id: createdId } = datum
    const { formidable, history } = this.props
    const { getReadOnlyUrl } = formidable
    formResolver()
    history.push(getReadOnlyUrl(createdId))
  }

  handleFormSubmit = formValues => {
    const { formidable, handleSubmitFoo } = this.props
    const { apiPath, method } = formidable
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
    const { formidable } = this.props
    const { readOnly } = formidable
    return (
      <input
        {...input}
        readOnly={readOnly}
        type="text"
      />
    )
  }

  renderForm = ({ handleSubmit }) => {
    const { formidable } = this.props
    const { readOnly } = formidable
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
    const { foo } = this.props
    return (
      <Form
        initialValues={foo}
        onSubmit={this.handleFormSubmit}
        render={this.renderForm}
      />
    )
  }
}

Foo.defaultProps = {
  foo: null
}

Foo.propTypes = {
  foo: PropTypes.shape({
    title: PropTypes.string.isRequired
  }),
  formidable: PropTypes.shape({
    apiPath: PropTypes.string,
    getReadOnlyUrl: PropTypes.func,
    isCreatedEntity: PropTypes.bool,
    method: PropTypes.string,
    modificationUrl: PropTypes.string,
    readOnly: PropTypes.bool
  }).isRequired,
  handleRequestFoo: PropTypes.func.isRequired,
  handleSubmitFoo: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      fooId: PropTypes.string
    }).isRequired
  }).isRequired,
}

const mapStateToProps = (state, ownProps) => ({
  foo: (state.data.foos || []).find(foo => foo.id === ownProps.match.params.fooId)
})

const mapDispatchProps = dispatch => ({
  handleRequestFoo: config => dispatch(requestData(config)),
  handleSubmitFoo: config => dispatch(requestData(config))
})

const FooContainer = compose(
  withRouter,
  withFormidable,
  connect(mapStateToProps, mapDispatchProps)
)(Foo)

const history = createBrowserHistory()
history.push('/foos/AE')
const store = createStore(rootReducer, storeEnhancer)

describe('withFormidable', () => {
  // when
  const wrapper = mount(
    <Provider store={store}>
      <Router history={history}>
        <Route path="/foos/:fooId([A-Z][a-z]+|creation)/:modification(modification)?">
          <FooContainer />
        </Route>
      </Router>
    </Provider>
  )

  describe('when we modify the title', () => {
    it('should have readonly input with the initial value', done => {
      setTimeout(() => {
        // then
        wrapper.update()
        const titleInputProps = wrapper
          .find('input[name="title"]')
          .props()
        const fooProps = wrapper.find('Foo').props()
        expect(titleInputProps.readOnly).toBe(true)
        expect(titleInputProps.value).toBe(foo.title)
        expect(fooProps.location.pathname)
          .toBe("/foos/AE")
        expect(fooProps.match.params)
          .toStrictEqual({ fooId: "AE", modification: undefined })

        // when
        wrapper.find('button[type="button"]').simulate('click')
        wrapper.find('input[name="title"]')
          .simulate('change', { target: { value: 'Jean-Luc' } })

        setTimeout(async () => {
          // then
          wrapper.update()
          const titleInputProps = wrapper
            .find('input[name="title"]')
            .props()
          const fooProps = wrapper.find('Foo').props()
          expect(titleInputProps.readOnly).toBe(false)
          expect(titleInputProps.value).toBe('Jean-Luc')
          expect(fooProps.location.pathname)
            .toBe("/foos/AE/modification")
          expect(fooProps.match.params)
            .toStrictEqual({ fooId: "AE", modification: "modification" })

          // when
          await act(async () => {
            wrapper.find('form').simulate('submit')
          })

          setTimeout(() => {
            // then
            wrapper.update()
            const titleInputProps = wrapper
              .find('input[name="title"]')
              .props()
            const fooProps = wrapper.find('Foo').props()
            expect(titleInputProps.readOnly).toBe(true)
            expect(titleInputProps.value).toBe('Jean-Luc')
            expect(fooProps.location.pathname)
              .toBe("/foos/AE")
            expect(fooProps.match.params)
              .toStrictEqual({ fooId: "AE", modification: undefined })
            done()
          })
        })
      })
    })
  })
})
