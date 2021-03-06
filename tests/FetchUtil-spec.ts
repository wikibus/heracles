import { EventEmitter } from 'events'
import SinkMap from '@rdfjs/sink-map'
import { Sink, Stream } from 'rdf-js'
import FetchUtil from '../src/FetchUtil'
import { Bodies } from './test-objects'
import { responseBuilder } from './test-utils'
import 'isomorphic-fetch'

describe('FetchUtil', () => {
    let mockFetch
    let fetchUtil
    const parsers = new SinkMap<EventEmitter, Stream>()

    beforeEach(() => {
        mockFetch = jest.fn()
        fetchUtil = FetchUtil(mockFetch, Headers)
    })

    beforeAll(() => {
        const dummyParser: Sink<EventEmitter, Stream> = {} as any

        parsers.set('application/ld+json', dummyParser)
        parsers.set('application/n-triples', dummyParser)
        parsers.set('application/n-quads', dummyParser)
    })

    describe('fetchResource', () => {
        it('should load resource with RDF accept header', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.resource('http://example.com/resource', { parsers })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.objectContaining({
                    headers: new Headers({
                        accept: 'application/ld+json, application/n-triples, application/n-quads',
                    }),
                }))
        })

        it('should append provided headers to the default', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.resource('http://example.com/resource', {
                parsers,
                headers: {
                    'x-foo': 'bar',
                },
            })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.objectContaining({
                    headers: new Headers({
                        'x-foo': 'bar',
                        accept: 'application/ld+json, application/n-triples, application/n-quads',
                    }),
                }))
        })

        it('should not alter accept header if other headers added', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.resource('http://example.com/resource', {
                parsers,
                headers: {
                    'x-foo': 'bar',
                },
            })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.objectContaining({
                    headers: new Headers({
                        accept: 'application/ld+json, application/n-triples, application/n-quads',
                        'x-foo': 'bar',
                    }),
                }))
        })

        it('should replace default accept header', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.resource('http://example.com/resource', {
                parsers,
                headers: {
                    accept: 'application/vnd.custom+rdf',
                },
            })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.objectContaining({
                    headers: new Headers({
                        accept: 'application/vnd.custom+rdf',
                    }),
                }))
        })
    })

    describe('invokeOperation', () => {
        it('should not send body with GET request', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.operation('get', 'http://example.com/resource', { parsers, body: 'foo' })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.not.objectContaining({
                    body: expect.anything(),
                }))
        })

        it('should append provided headers to the default', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.operation('get', 'http://example.com/resource', {
                parsers,
                headers: {
                    'x-foo': 'bar',
                },
            })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.objectContaining({
                    headers: new Headers({
                        'x-foo': 'bar',
                        accept: 'application/ld+json, application/n-triples, application/n-quads',
                    }),
                }))
        })

        it('should not alter accept header if other headers added', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.operation('get', 'http://example.com/resource', {
                parsers,
                headers: {
                    'x-foo': 'bar',
                },
            })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.objectContaining({
                    headers: new Headers({
                        accept: 'application/ld+json, application/n-triples, application/n-quads',
                        'x-foo': 'bar',
                    }),
                }))
        })

        it('should replace default accept header', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.operation('get', 'http://example.com/resource', {
                parsers,
                headers: {
                    accept: 'application/vnd.custom+rdf',
                },
            })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.objectContaining({
                    headers: new Headers({
                        accept: 'application/vnd.custom+rdf',
                    }),
                }))
        })

        it('should set not set content-type header for FormData bodies', async () => {
            // given
            mockFetch.mockReturnValue(responseBuilder().body(Bodies.someJsonLd).build())

            // when
            await fetchUtil.operation('post', 'http://example.com/resource', { parsers, body: new FormData() })

            // then
            expect(mockFetch)
                .toBeCalledWith(expect.anything(), expect.not.objectContaining({
                    headers: new Headers({
                        'content-type': expect.anything(),
                    }),
                }))
        })
    })
})
