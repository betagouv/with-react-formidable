import PropTypes from 'prop-types'
import React from 'react'

import useFormidable from './useFormidable'

export default WrappedComponent => {
  const _withFormidable = props => (
    <WrappedComponent
      formidable={useFormidable(props.location, props.match, props.name)}
      {...props}
    />
  )

  _withFormidable.defaultProps = {
    name: null
  }

  _withFormidable.propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape().isRequired
    }).isRequired,
    name: PropTypes.string,
  }

  _withFormidable.WrappedComponent = WrappedComponent

  return _withFormidable
}
