# Graphs

Oriented graph methods with shema and restrictions.

## Example

```js
var a = new Mongo.Collection('a');
var a1 = a.insert({ _id: 'a1' });
var a2 = a.insert({ _id: 'a2' );

var b = new Mongo.Collection('b');
b.attachGraph();
b.insertLink(a1, a2); // ~"b1"
var b1 = b.findLinkTo(a2); // { _id: "b1", _source: { id: 'a1', collection: 'a' }, _target: { id: 'a1', collection: 'a' } }
b1.source() // { _id: 'a1' }
```

## Documentation

### Methods

#### collection.attachGraph
> ()

Attach to the collection, all methods and all helpers.

Add to collection `collection.isGraph = true;`.

#### collection.insert.link
> (source: Document|Ref, target: Document|Ref, customFields: Object, callback?: Function) => id: String

#### collection.find.link
> (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined

##### Aliases
* `collection.findOne.link`

#### collection.find.link.to
> (target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined

#### collection.find.link.from
> (source: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined

#### collection.find.links
> (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Cursor

#### collection.find.links.to
> (target: Document|Ref|(id: String), query: Object, options: Object) => Cursor

#### collection.find.links.from
> (source: Document|Ref|(id: String), query: Object, options: Object) => Cursor

### Hooks
Used package [matb33:collection-hooks](https://github.com/matb33/meteor-collection-hooks).

Available field `this.action` containing` insert` `update` or` remove`.

#### collection.after.link
> (handler: (userId, doc, fieldNames, modifier, options) => void)

Wrapper around [matb33:collection-hooks](https://github.com/matb33/meteor-collection-hooks) [.after.update](https://github.com/matb33/meteor-collection-hooks#beforeupdateuserid-doc-fieldnames-modifier-options) and [.after.insert](https://github.com/matb33/meteor-collection-hooks#afterinsertuserid-doc).

#### collection.after.unlink
> (handler: (userId, doc, fieldNames, modifier, options) => void)

Wrapper around [matb33:collection-hooks](https://github.com/matb33/meteor-collection-hooks) [.after.update](https://github.com/matb33/meteor-collection-hooks#beforeupdateuserid-doc-fieldnames-modifier-options) and [.after.remove](https://github.com/matb33/meteor-collection-hooks#afterremoveuserid-doc).

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

## Versions

### 0.0.3
* Rename `.insert.link` argument `query` to `customFields`