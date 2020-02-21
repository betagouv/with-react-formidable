import { shallow } from 'enzyme'
import React from 'react'

import useFormidable from '../useFormidable'


const Bar = () => null

const Foo = ({ location, params, name }) => {
  const formidable = useFormidable(location, params, name)
  return <Bar formidable={formidable} />
}


describe('useFormidable', () => {
  describe('when location, match are in a readonly state', () => {
    it('should return a readonly form for a simple path', () => {
      // given
      const location = {
        pathname: "/foos/AE",
        search: ''
      }
      const params = {
        fooId: "AE"
      }

      // when
      const wrapper = shallow(<Foo
        location={location}
        params={params}
      />)

      // then
      const formidable = wrapper.find('Bar').props().formidable
      expect(formidable).toStrictEqual({
        apiPath: "/foos/AE",
        creationUrl: "/foos/creation",
        getReadOnlyUrl: expect.any(Function),
        id: "AE",
        isCreatedEntity: false,
        isModifiedEntity: false,
        method: undefined,
        modificationUrl: "/foos/AE/modification",
        name: "foo",
        readOnly: true
      })
      expect(formidable.getReadOnlyUrl("AE")).toBe("/foos/AE")
    })

    it('should return a readonly form with a complex path with several params', () => {
      // given
      const location = {
        pathname: "/foos/AE/bars/BF",
        search: ''
      }
      const params = {
        barId: "BF",
        fooId: "AE"
      }

      // when
      const wrapper = shallow(<Foo
        location={location}
        params={params}
      />)

      // then
      const formidable = wrapper.find('Bar').props().formidable
      expect(formidable).toStrictEqual({
        apiPath: "/bars/BF",
        creationUrl: "/foos/AE/bars/creation",
        getReadOnlyUrl: expect.any(Function),
        id: "BF",
        isCreatedEntity: false,
        isModifiedEntity: false,
        method: undefined,
        modificationUrl: "/foos/AE/bars/BF/modification",
        name: "bar",
        readOnly: true
      })
      expect(formidable.getReadOnlyUrl("BF")).toBe("/foos/AE/bars/BF")
    })
  })

  describe('when location, match are in a creation state', () => {
    it('should return a creation form for a simple path', () => {
      // given
      const location = {
        pathname: "/foos/creation",
        search: ''
      }
      const params = {
        fooId: "creation"
      }

      // when
      const wrapper = shallow(<Foo
        location={location}
        params={params}
      />)

      // then
      const formidable = wrapper.find('Bar').props().formidable
      expect(formidable).toStrictEqual({
        apiPath: "/foos",
        creationUrl: "/foos/creation",
        getReadOnlyUrl: expect.any(Function),
        id: "creation",
        isCreatedEntity: true,
        isModifiedEntity: false,
        method: "POST",
        modificationUrl: undefined,
        name: "foo",
        readOnly: false
      })
      expect(formidable.getReadOnlyUrl("AE")).toBe("/foos/AE")
    })

    it('should return a creation form for a complex path with several params', () => {
      // given
      const location = {
        pathname: "/foos/AE/bars/creation",
        search: ''
      }
      const params = {
        barId: "creation",
        fooId: "AE"
      }

      // when
      const wrapper = shallow(<Foo
        location={location}
        params={params}
      />)

      // then
      const formidable = wrapper.find('Bar').props().formidable
      expect(formidable).toStrictEqual({
        apiPath: "/bars",
        creationUrl: "/foos/AE/bars/creation",
        getReadOnlyUrl: expect.any(Function),
        id: "creation",
        isCreatedEntity: true,
        isModifiedEntity: false,
        method: "POST",
        modificationUrl: undefined,
        name: "bar",
        readOnly: false
      })
      expect(formidable.getReadOnlyUrl("BF")).toBe("/foos/AE/bars/BF")
    })
  })

  describe('when location, match are in a modification state', () => {
    it('should return a modification form for a simple path', () => {
      // given
      const location = {
        pathname: "/foos/AE/modification",
        search: ''
      }
      const params = {
        fooId: "AE",
        modification: "modification"
      }

      // when
      const wrapper = shallow(<Foo
        location={location}
        params={params}
      />)

      // then
      const formidable = wrapper.find('Bar').props().formidable
      expect(formidable).toStrictEqual({
        apiPath: "/foos/AE",
        creationUrl: "/foos/creation",
        getReadOnlyUrl: expect.any(Function),
        id: "AE",
        isCreatedEntity: false,
        isModifiedEntity: true,
        method: "PATCH",
        modificationUrl: "/foos/AE/modification",
        name: "foo",
        readOnly: false
      })
      expect(formidable.getReadOnlyUrl("AE")).toBe("/foos/AE")
    })

    it('should return a modification form for a complex path with several params', () => {
      // given
      const location = {
        pathname: "/foos/AE/bars/BF/modification",
        search: ''
      }
      const params = {
        barId: "BF",
        fooId: "AE",
        modification: "modification"
      }

      // when
      const wrapper = shallow(<Foo
        location={location}
        params={params}
      />)

      // then
      const formidable = wrapper.find('Bar').props().formidable
      expect(formidable).toStrictEqual({
        apiPath: "/bars/BF",
        creationUrl: "/foos/AE/bars/creation",
        getReadOnlyUrl: expect.any(Function),
        id: "BF",
        isCreatedEntity: false,
        isModifiedEntity: true,
        method: "PATCH",
        modificationUrl: "/foos/AE/bars/BF/modification",
        name: "bar",
        readOnly: false
      })
      expect(formidable.getReadOnlyUrl("BF")).toBe("/foos/AE/bars/BF")
    })
  })
})
