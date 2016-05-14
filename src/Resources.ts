'use strict';
import * as _ from 'lodash';
import { nonenumerable } from 'core-decorators';
import {JsonLd, Core} from './Constants';
//noinspection TypeScriptCheckImport
import {default} from 'core-js/es6/weak-map';

var _isProcessed = new WeakMap();
var _heracles = new WeakMap();

export class Resource implements IResource {

    constructor(heracles:IHeracles, actualResource) {
        _.extend(this, actualResource);

        _isProcessed.set(this, false);
        _heracles.set(this, heracles);
    }

    @nonenumerable
    get id() {
        return this[JsonLd.Id];
    }

    @nonenumerable
    get types() {
        var types = this[JsonLd.Type];

        if(typeof types === 'string'){
            return [ types ];
        }

        return types;
    }

    @nonenumerable
    get _processed() {
        return _isProcessed.get(this);
    }
    
    @nonenumerable
    get _heracles() {
        return _heracles.get(this);
    }
}

var _apiDocumentation = new WeakMap();
var _incomingLinks = new WeakMap();

export class HydraResource extends Resource implements IHydraResource {

    constructor(heracles:IHeracles, actualResource, apiDoc:IApiDocumentation, incomingLinks) {
        super(heracles, actualResource);

        _apiDocumentation.set(this, apiDoc);
        _incomingLinks.set(this, incomingLinks);
    }

    @nonenumerable
    get apiDocumentation() {
        return _apiDocumentation.get(this);
    }

    getIncomingLinks() {
        return _incomingLinks.get(this);
    }

    @nonenumerable
    set _processed(val:boolean) {
        _isProcessed.set(this, val);
    }

    getOperations() {
        var classOperations;
        if(_.isArray(this[JsonLd.Type])) {
            classOperations = _.map(this[JsonLd.Type], type => this.apiDocumentation.getOperations(type));
        } else {
            classOperations = [ this.apiDocumentation.getOperations(this[JsonLd.Type]) ];
        }

        var propertyOperations = _.chain(this.getIncomingLinks())
            .map(link => this.apiDocumentation.getOperations(link[0], link[1]))
            .union()
            .value();

        var operationPromises = [...classOperations, ...propertyOperations];
        
        return Promise.all(operationPromises)
            .then(results => _.flatten(results));
    }
}

export class PartialCollectionView extends HydraResource implements IPartialCollectionView {

    @nonenumerable
    get first() { return this[Core.Vocab.first] || null; }

    @nonenumerable
    get previous() { return this[Core.Vocab.previous] || null; }

    @nonenumerable
    get next() { return this[Core.Vocab.next] || null; }

    @nonenumerable
    get last() { return this[Core.Vocab.last] || null; }

    @nonenumerable
    get collection() {
        var collectionLink = _.find(this.getIncomingLinks(), linkArray => {
            return linkArray.predicate === Core.Vocab.view
        });

        return collectionLink ? collectionLink.subject : null
    }
}