!function(e){function r(e,r,t){e in i||(i[e]={name:e,declarative:!0,deps:r,declare:t,normalizedDeps:r})}function t(e){return c[e]||(c[e]={name:e,dependencies:[],exports:{},importers:[]})}function n(r){if(!r.module){var o=r.module=t(r.name),a=r.module.exports,s=r.declare.call(e,function(e,r){if(o.locked=!0,"object"==typeof e)for(var t in e)a[t]=e[t];else a[e]=r;for(var n=0,u=o.importers.length;u>n;n++){var i=o.importers[n];if(!i.locked)for(var s=0;s<i.dependencies.length;++s)i.dependencies[s]===o&&i.setters[s](a)}return o.locked=!1,r},r.name);o.setters=s.setters,o.execute=s.execute;for(var l=0,d=r.normalizedDeps.length;d>l;l++){var f,p=r.normalizedDeps[l],v=i[p],m=c[p];m?f=m.exports:v&&!v.declarative?f=v.esModule:v?(n(v),m=v.module,f=m.exports):f=u(p),m&&m.importers?(m.importers.push(o),o.dependencies.push(m)):o.dependencies.push(null),o.setters[l]&&o.setters[l](f)}}}function o(e){var r={};if("object"==typeof e||"function"==typeof e)if(l){var t;for(var n in e)(t=Object.getOwnPropertyDescriptor(e,n))&&f(r,n,t)}else{var o=e&&e.hasOwnProperty;for(var n in e)(!o||e.hasOwnProperty(n))&&(r[n]=e[n])}return r["default"]=e,f(r,"__useDefault",{value:!0}),r}function a(r,t){var n=i[r];if(n&&!n.evaluated&&n.declarative){t.push(r);for(var o=0,l=n.normalizedDeps.length;l>o;o++){var d=n.normalizedDeps[o];-1==s.call(t,d)&&(i[d]?a(d,t):u(d))}n.evaluated||(n.evaluated=!0,n.module.execute.call(e))}}function u(e){if(v[e])return v[e];if("@node/"==e.substr(0,6))return p(e.substr(6));var r=i[e];if(!r)throw"Module "+e+" not present.";return n(i[e]),a(e,[]),i[e]=void 0,r.declarative&&f(r.module.exports,"__esModule",{value:!0}),v[e]=r.declarative?r.module.exports:r.esModule}var i={},s=Array.prototype.indexOf||function(e){for(var r=0,t=this.length;t>r;r++)if(this[r]===e)return r;return-1},l=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(d){l=!1}var f;!function(){try{Object.defineProperty({},"a",{})&&(f=Object.defineProperty)}catch(e){f=function(e,r,t){try{e[r]=t.value||t.get.call(e)}catch(n){}}}}();var c={},p="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&require.resolve&&"undefined"!=typeof process&&require,v={"@empty":{}};return function(e,t,n){return function(a){a(function(a){for(var i=0;i<t.length;i++)(function(e,r){r&&r.__esModule?v[e]=r:v[e]=o(r)})(t[i],arguments[i]);n({register:r});var s=u(e[0]);if(e.length>1)for(var i=1;i<e.length;i++)u(e[i]);return s.__useDefault?s["default"]:s})}}}("undefined"!=typeof self?self:global)

(["1"], ["3","4","8","7","c"], function($__System) {

$__System.register("2", ["3", "4", "5"], function(exports_1, context_1) {
    'use strict';
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var li, jsonld_1, Constants;
    var FetchUtil, ExpandedWithDocs, FetchError;
    function rejectNotFoundStatus(res) {
        if (res.status === 404) {
            return Promise.reject(null);
        }
        return res;
    }
    function getDocumentationUri(res) {
        if (res.headers.has(Constants.Headers.Link)) {
            var linkHeaders = res.headers.get(Constants.Headers.Link);
            var links = li.parse(linkHeaders);
            return links[Constants.Core.Vocab.apiDocumentation];
        }
        return null;
    }
    function getFlattendGraph(res) {
        var mediaType = res.headers.get(Constants.Headers.ContentType) || Constants.MediaTypes.jsonLd;
        if (res.ok === false) {
            return Promise.reject(new FetchError(res));
        }
        if (mediaType === Constants.MediaTypes.jsonLd) {
            return res.json().then(flatten(res.url));
        }
        else {
            if (mediaType === Constants.MediaTypes.ntriples ||
                mediaType === Constants.MediaTypes.ntriples) {
                mediaType = 'application/nquads';
            }
            return res.text().then(function (rdf) {
                return jsonld_1.promises.fromRDF(rdf, { format: mediaType }).then(flatten(res.url));
            });
        }
    }
    function flatten(url) {
        return function (json) {
            var opts = {};
            if (url) {
                opts.base = url;
            }
            return jsonld_1.promises.expand(json, opts)
                .then(function (expanded) { return jsonld_1.promises.flatten(expanded, {}); })
                .then(function (flattened) { return flattened[Constants.JsonLd.Graph]; });
        };
    }
    return {
        setters:[
            function (li_1) {
                li = li_1;
            },
            function (jsonld_1_1) {
                jsonld_1 = jsonld_1_1;
            },
            function (Constants_1) {
                Constants = Constants_1;
            }],
        execute: function() {
            FetchUtil = (function () {
                function FetchUtil() {
                }
                FetchUtil.fetchResource = function (uri) {
                    return window.fetch(uri, {
                        headers: {
                            accept: FetchUtil._requestAcceptHeaders
                        }
                    })
                        .then(rejectNotFoundStatus)
                        .then(function (res) {
                        var apiDocsUri = getDocumentationUri(res);
                        return getFlattendGraph(res)
                            .then(function (obj) { return new ExpandedWithDocs(obj, apiDocsUri); });
                    }, function () { return null; });
                };
                FetchUtil.fetchDocumentation = function (uri) {
                    return window.fetch(uri, {
                        headers: {
                            accept: FetchUtil._requestAcceptHeaders
                        }
                    })
                        .then(rejectNotFoundStatus)
                        .then(getFlattendGraph, function () { return null; });
                };
                FetchUtil._requestAcceptHeaders = Constants.MediaTypes.jsonLd + ', ' + Constants.MediaTypes.ntriples + ', ' + Constants.MediaTypes.nquads;
                return FetchUtil;
            }());
            exports_1("FetchUtil", FetchUtil);
            ExpandedWithDocs = (function () {
                function ExpandedWithDocs(resources, apiDocumentationLink) {
                    this.resources = resources;
                    this.apiDocumentationLink = apiDocumentationLink;
                }
                return ExpandedWithDocs;
            }());
            FetchError = (function (_super) {
                __extends(FetchError, _super);
                function FetchError(response) {
                    _super.call(this, 'Request failed');
                    this._response = response;
                }
                Object.defineProperty(FetchError.prototype, "response", {
                    get: function () {
                        return this._response;
                    },
                    enumerable: true,
                    configurable: true
                });
                return FetchError;
            }(Error));
        }
    }
});

$__System.register("6", ["4", "8", "7", "5", "9"], function(exports_1, context_1) {
    'use strict';
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var jsonld_1, _, linkeddata_vocabs_1, Constants_1, JsonLdUtil_1;
    var flattenedDocs, ApiDocumentation, DocumentedResource, Operation, SupportedProperty, Class;
    return {
        setters:[
            function (jsonld_1_1) {
                jsonld_1 = jsonld_1_1;
            },
            function (_1) {
                _ = _1;
            },
            function (linkeddata_vocabs_1_1) {
                linkeddata_vocabs_1 = linkeddata_vocabs_1_1;
            },
            function (Constants_1_1) {
                Constants_1 = Constants_1_1;
            },
            function (JsonLdUtil_1_1) {
                JsonLdUtil_1 = JsonLdUtil_1_1;
            }],
        execute: function() {
            flattenedDocs = new WeakMap();
            ApiDocumentation = (function () {
                function ApiDocumentation(heracles, docId, apiDoc) {
                    this.id = docId;
                    this._original = apiDoc;
                    this._heracles = heracles;
                }
                ApiDocumentation.prototype.getOperations = function (classUri) {
                    var _this = this;
                    return this._getFlattened()
                        .then(function (graph) {
                        var supportedClass = _.find(graph, function (obj) { return JsonLdUtil_1.JsonLdUtil.idsEqual(obj[Constants_1.JsonLd.Id], classUri); });
                        if (!supportedClass) {
                            return [];
                        }
                        return _.chain(graph)
                            .filter(function (obj) { return JsonLdUtil_1.JsonLdUtil.idsEqual(obj[Constants_1.JsonLd.Id], supportedClass.supportedOperation) || _.some(supportedClass.supportedOperation, function (sp) { return JsonLdUtil_1.JsonLdUtil.idsEqual(sp, obj[Constants_1.JsonLd.Id]); }); })
                            .map(function (op) {
                            op[Constants_1.JsonLd.Context] = Constants_1.Core.Context;
                            return new Operation(op, _this);
                        })
                            .value();
                    });
                };
                ApiDocumentation.prototype.getProperties = function (classUri) {
                    var _this = this;
                    return this._getFlattened()
                        .then(function (graph) {
                        var supportedClass = _.find(graph, function (obj) { return JsonLdUtil_1.JsonLdUtil.idsEqual(obj[Constants_1.JsonLd.Id], classUri); });
                        if (!supportedClass) {
                            return [];
                        }
                        return _.chain(graph)
                            .filter(function (obj) { return JsonLdUtil_1.JsonLdUtil.idsEqual(obj[Constants_1.JsonLd.Id], supportedClass.supportedProperty) || _.some(supportedClass.supportedProperty, function (sp) { return JsonLdUtil_1.JsonLdUtil.idsEqual(sp, obj[Constants_1.JsonLd.Id]); }); })
                            .map(function (prop) {
                            prop[Constants_1.JsonLd.Context] = Constants_1.Core.Context;
                            return new SupportedProperty(prop, _this);
                        })
                            .value();
                    });
                };
                ApiDocumentation.prototype.getClasses = function () {
                    var _this = this;
                    return this._getFlattened()
                        .then(function (graph) {
                        return _.chain(graph)
                            .filter(function (obj) { return obj[Constants_1.JsonLd.Type] === 'Class'; })
                            .map(function (sc) { return new Class(sc, _this); })
                            .value();
                    });
                };
                ApiDocumentation.prototype.getClass = function (classId) {
                    return this.getClasses().then(function (cs) { return _.find(cs, ['id', classId]) || null; });
                };
                ApiDocumentation.prototype.getEntrypoint = function () {
                    var _this = this;
                    return this._getFlattened()
                        .then(function (graph) {
                        var doc = _.find(graph, function (obj) { return JsonLdUtil_1.JsonLdUtil.idsEqual(obj[Constants_1.JsonLd.Id], _this.id); });
                        return _this._heracles.loadResource(doc.entrypoint);
                    });
                };
                ApiDocumentation.prototype._getFlattened = function () {
                    var _this = this;
                    if (flattenedDocs.has(this)) {
                        return Promise.resolve(flattenedDocs.get(this));
                    }
                    return jsonld_1.promises.flatten(this._original, Constants_1.Core.Context)
                        .then(function (flat) {
                        flattenedDocs.set(_this, flat[Constants_1.JsonLd.Graph]);
                        return flat[Constants_1.JsonLd.Graph];
                    });
                };
                return ApiDocumentation;
            }());
            exports_1("ApiDocumentation", ApiDocumentation);
            DocumentedResource = (function () {
                function DocumentedResource(hydraResource) {
                    this._hydraResource = hydraResource;
                }
                Object.defineProperty(DocumentedResource.prototype, "id", {
                    get: function () {
                        return this._hydraResource['@id'];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentedResource.prototype, "description", {
                    get: function () {
                        return this._hydraResource.description ||
                            this._hydraResource[linkeddata_vocabs_1.rdfs.ns + 'comment'] ||
                            this._hydraResource[linkeddata_vocabs_1.schema.description];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentedResource.prototype, "title", {
                    get: function () {
                        return this._hydraResource.title ||
                            this._hydraResource[linkeddata_vocabs_1.rdfs.ns + 'label'] ||
                            this._hydraResource[linkeddata_vocabs_1.schema.title];
                    },
                    enumerable: true,
                    configurable: true
                });
                DocumentedResource.prototype.compact = function (context) {
                    if (context === void 0) { context = null; }
                    return jsonld_1.promises.compact(this._hydraResource, context || Constants_1.Core.Context);
                };
                return DocumentedResource;
            }());
            exports_1("DocumentedResource", DocumentedResource);
            Operation = (function (_super) {
                __extends(Operation, _super);
                function Operation(hydraOperation, apiDoc) {
                    _super.call(this, hydraOperation);
                    this._hydraOperation = hydraOperation;
                    this._apiDoc = apiDoc;
                }
                Object.defineProperty(Operation.prototype, "method", {
                    get: function () {
                        return this._hydraOperation.method;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Operation.prototype, "expects", {
                    get: function () {
                        return this._hydraOperation.expects;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Operation.prototype, "returns", {
                    get: function () {
                        return this._hydraOperation.returns;
                    },
                    enumerable: true,
                    configurable: true
                });
                Operation.prototype.getExpected = function () {
                    if (this.expects === linkeddata_vocabs_1.owl.ns + 'Nothing') {
                        return Promise.reject(new Error('Operation expects nothing'));
                    }
                    return this._apiDoc.getClass(this.expects);
                };
                Operation.prototype.getReturned = function () {
                    if (this.returns === linkeddata_vocabs_1.owl.ns + 'Nothing') {
                        return Promise.reject(new Error('Operation returns nothing'));
                    }
                    return this._apiDoc.getClass(this.returns);
                };
                return Operation;
            }(DocumentedResource));
            exports_1("Operation", Operation);
            SupportedProperty = (function (_super) {
                __extends(SupportedProperty, _super);
                function SupportedProperty(hydraSupportedProperty, apiDoc) {
                    _super.call(this, hydraSupportedProperty);
                    this._hydraSupportedProperty = hydraSupportedProperty;
                    this._apiDoc = apiDoc;
                }
                Object.defineProperty(SupportedProperty.prototype, "readable", {
                    get: function () {
                        if (typeof this._hydraSupportedProperty.readable === 'undefined') {
                            return true;
                        }
                        return this._hydraSupportedProperty.readable;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SupportedProperty.prototype, "writable", {
                    get: function () {
                        if (typeof this._hydraSupportedProperty.writable === 'undefined') {
                            return true;
                        }
                        return this._hydraSupportedProperty.writable;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SupportedProperty.prototype, "required", {
                    get: function () {
                        if (typeof this._hydraSupportedProperty.required === 'undefined') {
                            return false;
                        }
                        return this._hydraSupportedProperty.required;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SupportedProperty.prototype, "property", {
                    get: function () {
                        return this._hydraSupportedProperty.property;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SupportedProperty;
            }(DocumentedResource));
            exports_1("SupportedProperty", SupportedProperty);
            Class = (function (_super) {
                __extends(Class, _super);
                function Class(hydraClass, apiDoc) {
                    _super.call(this, hydraClass);
                    this._hydraClass = hydraClass;
                    this._apiDoc = apiDoc;
                }
                Class.prototype.getSupportedOperations = function () {
                    return this._apiDoc.getOperations(this.id);
                };
                Class.prototype.getSupportedProperties = function () {
                    return this._apiDoc.getProperties(this.id);
                };
                return Class;
            }(DocumentedResource));
            exports_1("Class", Class);
        }
    }
});

$__System.register("9", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var JsonLdUtil;
    return {
        setters:[],
        execute: function() {
            JsonLdUtil = (function () {
                function JsonLdUtil() {
                }
                JsonLdUtil.idsEqual = function (id1, id2) {
                    return JsonLdUtil.trimTrailingSlash(id1) === JsonLdUtil.trimTrailingSlash(id2);
                };
                JsonLdUtil.trimTrailingSlash = function (uri) {
                    if (!uri || !uri.replace) {
                        return null;
                    }
                    // todo: is this really correct to ignore trailing slash?
                    return uri.replace(/\/$/, '');
                };
                return JsonLdUtil;
            }());
            exports_1("JsonLdUtil", JsonLdUtil);
        }
    }
});

$__System.register("a", ["8", "b", "5", "9"], function(exports_1, context_1) {
    'use strict';
    var __moduleName = context_1 && context_1.id;
    var _, Types, Constants_1, JsonLdUtil_1;
    var ResourceFactory, IncomingLink;
    function findIncomingLinks(object, resources) {
        return _.transform(resources, function (acc, res, key) {
            _.forOwn(res, function (value, predicate) {
                if (value && value[Constants_1.JsonLd.Id] && JsonLdUtil_1.JsonLdUtil.idsEqual(value[Constants_1.JsonLd.Id], object[Constants_1.JsonLd.Id])) {
                    acc.push(new IncomingLink(key, predicate, resources));
                }
            });
        }, []);
    }
    return {
        setters:[
            function (_1) {
                _ = _1;
            },
            function (Types_1) {
                Types = Types_1;
            },
            function (Constants_1_1) {
                Constants_1 = Constants_1_1;
            },
            function (JsonLdUtil_1_1) {
                JsonLdUtil_1 = JsonLdUtil_1_1;
            }],
        execute: function() {
            ResourceFactory = (function () {
                function ResourceFactory() {
                }
                ResourceFactory.prototype.createResource = function (obj, apiDocumentation, resources) {
                    var incomingLinks = findIncomingLinks(obj, resources);
                    switch (obj[Constants_1.JsonLd.Type]) {
                        case Constants_1.Core.Vocab.PartialCollectionView:
                            return new Types.PartialCollectionView(obj, apiDocumentation, incomingLinks);
                    }
                    return new Types.Resource(obj, apiDocumentation, incomingLinks);
                };
                return ResourceFactory;
            }());
            exports_1("ResourceFactory", ResourceFactory);
            IncomingLink = (function () {
                function IncomingLink(id, predicate, resoruces) {
                    this._id = id;
                    this._predicate = predicate;
                    Object.defineProperty(this, 'subject', {
                        get: function () { return resoruces[id]; }
                    });
                }
                Object.defineProperty(IncomingLink.prototype, "subjectId", {
                    get: function () {
                        return this._id;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(IncomingLink.prototype, "predicate", {
                    get: function () {
                        return this._predicate;
                    },
                    enumerable: true,
                    configurable: true
                });
                return IncomingLink;
            }());
        }
    }
});

$__System.register("5", [], function(exports_1, context_1) {
    'use strict';
    var __moduleName = context_1 && context_1.id;
    var Core, JsonLd, MediaTypes, Headers;
    return {
        setters:[],
        execute: function() {
            (function (Core) {
                Core.Context = {
                    "hydra": "http://www.w3.org/ns/hydra/core#",
                    "apiDocumentation": "hydra:apiDocumentation",
                    "ApiDocumentation": "hydra:ApiDocumentation",
                    "title": "hydra:title",
                    "description": "hydra:description",
                    "entrypoint": { "@id": "hydra:entrypoint", "@type": "@id" },
                    "supportedClass": { "@id": "hydra:supportedClass", "@type": "@vocab" },
                    "Class": "hydra:Class",
                    "supportedProperty": { "@id": "hydra:supportedProperty", "@type": "@id" },
                    "SupportedProperty": "hydra:SupportedProperty",
                    "property": { "@id": "hydra:property", "@type": "@vocab" },
                    "required": "hydra:required",
                    "readonly": "hydra:readonly",
                    "writeonly": "hydra:writeonly",
                    "supportedOperation": { "@id": "hydra:supportedOperation", "@type": "@id" },
                    "Operation": "hydra:Operation",
                    "CreateResourceOperation": "hydra:CreateResourceOperation",
                    "ReplaceResourceOperation": "hydra:ReplaceResourceOperation",
                    "DeleteResourceOperation": "hydra:DeleteResourceOperation",
                    "method": "hydra:method",
                    "expects": { "@id": "hydra:expects", "@type": "@vocab" },
                    "returns": { "@id": "hydra:returns", "@type": "@vocab" },
                    "statusCodes": { "@id": "hydra:statusCodes", "@type": "@id" },
                    "StatusCodeDescription": "hydra:StatusCodeDescription",
                    "statusCode": "hydra:statusCode",
                    "Error": "hydra:Error",
                    "Resource": "hydra:Resource",
                    "operation": "hydra:operation",
                    "Collection": "hydra:Collection",
                    "member": { "@id": "hydra:member", "@type": "@id" },
                    "search": "hydra:search",
                    "freetextQuery": "hydra:freetextQuery",
                    "PagedCollection": "hydra:PagedCollection",
                    "totalItems": "hydra:totalItems",
                    "itemsPerPage": "hydra:itemsPerPage",
                    "firstPage": { "@id": "hydra:firstPage", "@type": "@id" },
                    "lastPage": { "@id": "hydra:lastPage", "@type": "@id" },
                    "nextPage": { "@id": "hydra:nextPage", "@type": "@id" },
                    "previousPage": { "@id": "hydra:previousPage", "@type": "@id" },
                    "Link": "hydra:Link",
                    "TemplatedLink": "hydra:TemplatedLink",
                    "IriTemplate": "hydra:IriTemplate",
                    "template": "hydra:template",
                    "mapping": "hydra:mapping",
                    "IriTemplateMapping": "hydra:IriTemplateMapping",
                    "variable": "hydra:variable"
                };
                Core.Vocab = {
                    apiDocumentation: Core.Context['hydra'] + 'apiDocumentation',
                    title: Core.Context['hydra'] + 'title',
                    description: Core.Context['hydra'] + 'description',
                    method: Core.Context['hydra'] + 'method',
                    Class: Core.Context['hydra'] + 'Class',
                    member: Core.Context['hydra'] + 'member',
                    PartialCollectionView: Core.Context['hydra'] + 'PartialCollectionView',
                    view: Core.Context['hydra'] + 'view',
                    first: Core.Context['hydra'] + 'first',
                    next: Core.Context['hydra'] + 'next',
                    last: Core.Context['hydra'] + 'last',
                    previous: Core.Context['hydra'] + 'previous',
                    entrypoint: Core.Context['hydra'] + 'entrypoint'
                };
            })(Core = Core || (Core = {}));
            exports_1("Core", Core);
            (function (JsonLd) {
                JsonLd.Graph = '@graph';
                JsonLd.Context = '@context';
                JsonLd.Id = '@id';
                JsonLd.Type = '@type';
            })(JsonLd = JsonLd || (JsonLd = {}));
            exports_1("JsonLd", JsonLd);
            (function (MediaTypes) {
                MediaTypes.jsonLd = 'application/ld+json';
                MediaTypes.ntriples = 'application/n-triples';
                MediaTypes.nquads = 'application/n-quads';
            })(MediaTypes = MediaTypes || (MediaTypes = {}));
            exports_1("MediaTypes", MediaTypes);
            (function (Headers) {
                Headers.Link = 'Link';
                Headers.ContentType = 'Content-Type';
            })(Headers = Headers || (Headers = {}));
            exports_1("Headers", Headers);
        }
    }
});

$__System.register("b", ["8", "c", "5"], function(exports_1, context_1) {
    'use strict';
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var _, core_decorators_1, Constants_1;
    var _apiDocumentation, _incomingLinks, _isProcessed, Resource, PartialCollectionView;
    return {
        setters:[
            function (_1) {
                _ = _1;
            },
            function (core_decorators_1_1) {
                core_decorators_1 = core_decorators_1_1;
            },
            function (Constants_1_1) {
                Constants_1 = Constants_1_1;
            }],
        execute: function() {
            _apiDocumentation = new WeakMap();
            _incomingLinks = new WeakMap();
            _isProcessed = new WeakMap();
            Resource = (function () {
                function Resource(actualResource, apiDoc, incomingLinks) {
                    _.extend(this, actualResource);
                    _apiDocumentation.set(this, apiDoc);
                    _incomingLinks.set(this, incomingLinks);
                    _isProcessed.set(this, false);
                }
                Object.defineProperty(Resource.prototype, "id", {
                    get: function () {
                        return this[Constants_1.JsonLd.Id];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Resource.prototype, "apiDocumentation", {
                    get: function () {
                        return _apiDocumentation.get(this);
                    },
                    enumerable: true,
                    configurable: true
                });
                Resource.prototype.getIncomingLinks = function () {
                    return _incomingLinks.get(this);
                };
                Resource.prototype._processed = function () {
                    return _isProcessed.get(this);
                };
                Resource.prototype._processed = function (val) {
                    _isProcessed.set(this, val);
                };
                Resource.prototype.getOperations = function () {
                    var _this = this;
                    var classOperations;
                    if (_.isArray(this[Constants_1.JsonLd.Type])) {
                        classOperations = _.map(this[Constants_1.JsonLd.Type], function (type) { return _this.apiDocumentation.getOperations(type); });
                    }
                    else {
                        classOperations = [this.apiDocumentation.getOperations(this[Constants_1.JsonLd.Type])];
                    }
                    var propertyOperations = _.chain(this.getIncomingLinks())
                        .map(function (link) { return _this.apiDocumentation.getOperations(link[0], link[1]); })
                        .union()
                        .value();
                    var operationPromises = classOperations.concat(propertyOperations);
                    return Promise.all(operationPromises)
                        .then(function (results) { return _.flatten(results); });
                };
                __decorate([
                    core_decorators_1.nonenumerable
                ], Resource.prototype, "id", null);
                __decorate([
                    core_decorators_1.nonenumerable
                ], Resource.prototype, "apiDocumentation", null);
                return Resource;
            }());
            exports_1("Resource", Resource);
            PartialCollectionView = (function (_super) {
                __extends(PartialCollectionView, _super);
                function PartialCollectionView() {
                    _super.apply(this, arguments);
                }
                Object.defineProperty(PartialCollectionView.prototype, "first", {
                    get: function () { return this[Constants_1.Core.Vocab.first] || null; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(PartialCollectionView.prototype, "previous", {
                    get: function () { return this[Constants_1.Core.Vocab.previous] || null; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(PartialCollectionView.prototype, "next", {
                    get: function () { return this[Constants_1.Core.Vocab.next] || null; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(PartialCollectionView.prototype, "last", {
                    get: function () { return this[Constants_1.Core.Vocab.last] || null; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(PartialCollectionView.prototype, "collection", {
                    get: function () {
                        var collectionLink = _.find(this.getIncomingLinks(), function (linkArray) {
                            return linkArray.predicate === Constants_1.Core.Vocab.view;
                        });
                        return collectionLink ? collectionLink.subject : null;
                    },
                    enumerable: true,
                    configurable: true
                });
                __decorate([
                    core_decorators_1.nonenumerable
                ], PartialCollectionView.prototype, "first", null);
                __decorate([
                    core_decorators_1.nonenumerable
                ], PartialCollectionView.prototype, "previous", null);
                __decorate([
                    core_decorators_1.nonenumerable
                ], PartialCollectionView.prototype, "next", null);
                __decorate([
                    core_decorators_1.nonenumerable
                ], PartialCollectionView.prototype, "last", null);
                __decorate([
                    core_decorators_1.nonenumerable
                ], PartialCollectionView.prototype, "collection", null);
                return PartialCollectionView;
            }(Resource));
            exports_1("PartialCollectionView", PartialCollectionView);
        }
    }
});

$__System.register("1", ["8", "2", "6", "5", "9", "a", "b"], function(exports_1, context_1) {
    'use strict';
    var __moduleName = context_1 && context_1.id;
    var _, FetchUtil_1, ApiDocumentation_1, Constants_1, JsonLdUtil_1, ResourceFactory_1, Resources_1;
    var Heracles, ResourceFactory, Resource, Hydra;
    function getRequestedObject(uri, resources, resourceFactory) {
        return function (apiDocumentation) {
            var resourcified = {};
            _.transform(resources, function (acc, val) {
                var id = JsonLdUtil_1.JsonLdUtil.trimTrailingSlash(val[Constants_1.JsonLd.Id]);
                acc[id] = resourceFactory.createResource(val, apiDocumentation, acc);
            }, resourcified);
            _.each(resourcified, function (g) { return resourcify(g, resourcified, apiDocumentation, resourceFactory); });
            var resource = resourcified[JsonLdUtil_1.JsonLdUtil.trimTrailingSlash(uri)];
            if (!resource) {
                return Promise.reject(new Error('Resource ' + uri + ' was not found in the response'));
            }
            return resource;
        };
    }
    function resourcify(obj, resourcified, apiDoc, resourceFactory) {
        if (_.isObject(obj) === false) {
            return obj;
        }
        var selfId = JsonLdUtil_1.JsonLdUtil.trimTrailingSlash(obj[Constants_1.JsonLd.Id]);
        var resource = resourcified[selfId];
        if (resourcified[selfId] instanceof Resource === false) {
            resource = resourceFactory.createResource(obj, apiDoc, resourcified);
            resourcified[selfId] = resource;
        }
        if (resource._processed() === true) {
            return resource;
        }
        _.forOwn(resource, function (value, key) {
            if (_.isArray(value)) {
                resource[key] = _.map(value, function (el) { return resourcify(el, resourcified, apiDoc, resourceFactory); });
                return;
            }
            resource[key] = resourcify(value, resourcified, apiDoc, resourceFactory);
        });
        resource._processed(true);
        return resource;
    }
    return {
        setters:[
            function (_1) {
                _ = _1;
            },
            function (FetchUtil_1_1) {
                FetchUtil_1 = FetchUtil_1_1;
            },
            function (ApiDocumentation_1_1) {
                ApiDocumentation_1 = ApiDocumentation_1_1;
            },
            function (Constants_1_1) {
                Constants_1 = Constants_1_1;
            },
            function (JsonLdUtil_1_1) {
                JsonLdUtil_1 = JsonLdUtil_1_1;
            },
            function (ResourceFactory_1_1) {
                ResourceFactory_1 = ResourceFactory_1_1;
            },
            function (Resources_1_1) {
                Resources_1 = Resources_1_1;
            }],
        execute: function() {
            Heracles = (function () {
                function Heracles() {
                    this.resourceFactory = new ResourceFactory_1.ResourceFactory();
                }
                Heracles.prototype.loadResource = function (uri) {
                    var _this = this;
                    return FetchUtil_1.FetchUtil.fetchResource(uri)
                        .then(function (response) {
                        return FetchUtil_1.FetchUtil.fetchDocumentation(response.apiDocumentationLink)
                            .then(function (docsObject) {
                            return new ApiDocumentation_1.ApiDocumentation(_this, response.apiDocumentationLink, docsObject);
                        }, function () { return null; }).then(getRequestedObject(uri, response.resources, _this.resourceFactory));
                    });
                };
                return Heracles;
            }());
            exports_1("ResourceFactory", ResourceFactory = ResourceFactory_1.ResourceFactory);
            exports_1("Resource", Resource = Resources_1.Resource);
            exports_1("Hydra", Hydra = new Heracles());
        }
    }
});

})
(function(factory) {
  define(["li","jsonld","lodash","jasnell/linkeddata-vocabs","core-decorators"], factory);
});