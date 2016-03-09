# Graphs

Oriented graph methods with shema and restrictions.

## Install

```
meteor add shuttler:graphs
```

##### Required
* [shuttler:ref](https://github.com/meteor-shuttler/ref)

## Example

```js
var a = new Mongo.Collection('a');
var a1 = a.insert({ _id: 'a1' });
var a2 = a.insert({ _id: 'a2' );

var b = new Mongo.Collection('b');
b.attachGraph();
b.link.insert(a1, a2); // ~"b1"
b.link.find.to(a2); // { _id: "b1", _source: { id: 'a1', collection: 'a' }, _target: { id: 'a1', collection: 'a' } }
b1.source() // { _id: 'a1' }
```

## Documentation

### Methods

#### collection.attachGraph
> ()

Attach to the collection, all methods and all helpers.

Add to collection `collection.isGraph = true;`.

#### collection.link.insert
> (source: Document|Ref, target: Document|Ref, customFields: Object, callback?: Function) => id: String

#### collection.link.find
> (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined

##### Aliases
* `collection.link.findOne` `collection.links.findOne`

#### collection.link.find.to
> (target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined

##### Aliases
* `collection.*.*.target`

#### collection.link.find.from
> (source: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined

##### Aliases
* `collection.*.*.source`

#### collection.links.find
> (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Cursor

#### collection.links.find.to
> (target: Document|Ref|(id: String), query: Object, options: Object) => Cursor

##### Aliases
* `collection.*.*.target`

#### collection.links.find.from
> (source: Document|Ref|(id: String), query: Object, options: Object) => Cursor

##### Aliases
* `collection.*.*.source`

### Hooks
Used package [matb33:collection-hooks](https://github.com/matb33/meteor-collection-hooks).

Available field `this.action` containing` insert` `update` or` remove`.
Available fields `this.sourceChanged: Boolean` and `this.targetChanged: Boolean`.

#### collection.after.link
> (handler: (userId, unlinked?, linked, fieldNames, modifier, options) => void)

`unlinked` is defined only on `update`.

Wrapper around [matb33:collection-hooks](https://github.com/matb33/meteor-collection-hooks) [.after.update](https://github.com/matb33/meteor-collection-hooks#beforeupdateuserid-doc-fieldnames-modifier-options) and [.after.insert](https://github.com/matb33/meteor-collection-hooks#afterinsertuserid-doc).

#### collection.after.unlink
> (handler: (userId, unlinked, linked?, fieldNames, modifier, options) => void)

`linked` is defined only on `update`.

Wrapper around [matb33:collection-hooks](https://github.com/matb33/meteor-collection-hooks) [.after.update](https://github.com/matb33/meteor-collection-hooks#beforeupdateuserid-doc-fieldnames-modifier-options) and [.after.remove](https://github.com/matb33/meteor-collection-hooks#afterremoveuserid-doc).

#### collection.after.link.source
> (handler: (userId, unlinked?, linked, fieldNames, modifier, options) => void)

#### collection.after.link.target
> (handler: (userId, unlinked?, linked, fieldNames, modifier, options) => void)

#### collection.after.unlink.source
> (handler: (userId, unlinked, linked?, fieldNames, modifier, options) => void)

#### collection.after.unlink.target
> (handler: (userId, unlinked, linked?, fieldNames, modifier, options) => void)

### Helpers
Used package [dburles:collection-helpers](https://github.com/dburles/meteor-collection-helpers/).

#### document.source
> () => Document|undefined

#### document.target
> () => Document|undefined

### Restrictions
Used package [ivansglazunov:restrict](https://github.com/ivansglazunov/meteor-restrict).

Add new restriction checks. In the case of operation `insert` the arguments `fieldNames` and `modifier` are not exists. Available argument `action` containing` insert` `update` or` remove`.

> handler: (userId, doc, fieldNames, modifier, action) => Boolean

```js
collection.allow({
    'link': function(userId, doc, fieldNames, modifier, action) {
    	return true;
    },
    'link.source': function(userId, doc, fieldNames, modifier, action) {
    	return true;
    },
    'link.target': function(userId, doc, fieldNames, modifier, action) {
    	return true;
    },
    'unlink': function(userId, doc, fieldNames, modifier, action) {
    	return true;
    },
    'unlink.source': function(userId, doc, fieldNames, modifier, action) {
    	return true;
    },
    'unlink.target': function(userId, doc, fieldNames, modifier, action) {
    	return true;
    }
});
collection.deny({
    'link': function(userId, doc, fieldNames, modifier, action) {
    	return false;
    },
    'link.source': function(userId, doc, fieldNames, modifier, action) {
    	return false;
    },
    'link.target': function(userId, doc, fieldNames, modifier, action) {
    	return false;
    },
    'unlink': function(userId, doc, fieldNames, modifier, action) {
    	return false;
    },
    'unlink.source': function(userId, doc, fieldNames, modifier, action) {
    	return false;
    },
    'unlink.target': function(userId, doc, fieldNames, modifier, action) {
    	return false;
    }
});
```

### Methods

#### Shuttler.getSelectorByDirection
> (direction: 'source'|'target'|'link', link: Document|Ref) => Object

```js
test = Mongo.Collection('test');
test.attachGraph();
test.insert({ _id: '2' });
test.insert({ _id: '3' });
test.link.insert(test.findOne('2'), test.findOne('3'), { _id: '1' });
Shuttler.getSelectorByDirection('source', test.findOne('1'));
// { '_source.collection': 'test', '_source.id': '3' }
Shuttler.getSelectorByDirection('link', test.findOne('1'));
// { '_id': '1' }
```

#### Shuttler.getRefByDirection
> (direction: 'source'|'target'|'link', link: Document|Ref) => Object

```js
test = Mongo.Collection('test');
test.attachGraph();
test.insert({ _id: '2' });
test.insert({ _id: '3' });
test.link.insert(test.findOne('2'), test.findOne('3'), { _id: '1' });
Shuttler.getRefByDirection('source', test.findOne('1'));
// { collection: 'test', id: '2' }
Shuttler.getRefByDirection('link', test.findOne('1'));
// { collection: 'test', id: '1' }
```

#### Shuttler.getDocumentByDirection
> (direction: 'source'|'target'|'link', link: Document|Ref) => Object

```js
test = Mongo.Collection('test');
test.attachGraph();
test.insert({ _id: '2' });
test.insert({ _id: '3' });
test.link.insert(test.findOne('2'), test.findOne('3'), { _id: '1' });
Shuttler.getRefByDirection('source', test.findOne('1'));
// { _id: '2' }
Shuttler.getRefByDirection('link', test.findOne('1'));
// {  _id: '1', _source: { collection: 'test', id: '2' }, _target: { collection: 'test', id: '3' } }
```

### Schemas

#### Shuttler.GraphSidesSchema
[Source code](https://github.com/meteor-shuttler/graphs/blob/master/graphs.js#L195-L207)

#### Shuttler.GraphDirectionSchema
[Source code](https://github.com/meteor-shuttler/graphs/blob/master/graphs.js#L210-L223)

#### Shuttler.GraphDirectionsSchema
[Source code](https://github.com/meteor-shuttler/graphs/blob/master/graphs.js#L225-L240)

## Versions

### 0.0.9
* New syntax of hooks with `unlinked` and `linked` variables.
* Little fixes

### 0.0.8
* Support for `ivansglazunov:restrict@0.0.5`
* Direction and sides schemas and methods.

### 0.0.6
* [Hot fix imposition of prototypes on the server](https://github.com/meteor-shuttler/graphs/issues/5)

### 0.0.5
* [Add support collection-hooks fetchPrevious](https://github.com/meteor-shuttler/graphs/issues/2)
* [Add aliases](https://github.com/meteor-shuttler/graphs/issues/3)

### 0.0.4
* Add `.after.link.source`, `.after.link.target`, `.after.unlink.source`, `.after.unlink.target`
* Add to after handler `this.sourceChanged` and `this.targetChanged`

### 0.0.3
* Rename `.insert.link` argument `query` to `customFields`