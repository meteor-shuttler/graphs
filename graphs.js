// ()
Mongo.Collection.prototype.attachGraph = function() {
	this.isGraph = true;
	
	var collection = this;
	
	this.attachSchema(
		new SimpleSchema({
			_source: { type: Shuttler.Ref.Schema },
			_target: { type: Shuttler.Ref.Schema }
		})
	);
	
	// (source: Document|Ref, target: Document|Ref, query: Object, callback?: Function) => id: String
	this.insert.link = function(source, target, query, callback) {
		return collection.insert(lodash.merge(
			{ _source: Shuttler.Ref.new(source), _target: Shuttler.Ref.new(target) }
			,query
		), callback);
	};
	
	// (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined
	this.findOne.link = function(source, target, query, options) {
		return collection.findOne(lodash.merge(
			Shuttler.Ref.new(source, '_source'), Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined
	this.findOne.link.to = function(target, query, options) {
		return collection.findOne(lodash.merge(
			Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (source: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined
	this.findOne.link.from = function(source, query, options) {
		return collection.findOne(lodash.merge(
			Shuttler.Ref.new(source, '_source'), query
		), options);
	};
	
	this.find.link = this.findOne.link;
	
	// (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Cursor
	this.find.links = function(source, target, query, options) {
		return collection.find(lodash.merge(
			Shuttler.Ref.new(source, '_source'), Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (target: Document|Ref|(id: String), query: Object, options: Object) => Cursor
	this.find.links.to = function(target, query, options) {
		return collection.find(lodash.merge(
			Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (source: Document|Ref|(id: String), query: Object, options: Object) => Cursor
	this.find.links.from = function(source, query, options) {
		return collection.find(lodash.merge(
			Shuttler.Ref.new(source, '_source'), query
		), options);
	};
	
	// (handler: (userId, doc, fieldNames, modifier, options) => void)
	this.after.link = function(handler) {
		collection.after.update(function(userId, doc, fieldNames, modifier, options) {
			if (!lodash.isEqual(this.previous._source, doc._source) || !lodash.isEqual(this.previous._target, doc._target)) {
				this.action = 'update';
				handler.apply(this, arguments);
			}
		});
		collection.after.insert(function(userId, doc) {
			this.action = 'insert';
			handler.apply(this, arguments);
		});
	};
	
	// (handler: (userId, doc, fieldNames?, modifier?, options?) => void)
	this.after.unlink = function(handler) {
		collection.after.update(function(userId, doc, fieldNames, modifier, options) {
			if (!lodash.isEqual(this.previous._source, doc._source) || !lodash.isEqual(this.previous._target, doc._target)) {
				this.action = 'update';
				handler.apply(this, arguments);
			}
		});
		collection.after.remove(function(userId, doc) {
			this.action = 'remove';
			handler.apply(this, arguments);
		});
	};
	
	this.helpers({
		source: function() {
			return Shuttler.Ref(this._source);
		},
		target: function() {
			return Shuttler.Ref(this._target);
		}
	});
	
	this.attachRestriction('link');
	this.attachRestriction('link.source');
	this.attachRestriction('link.target');
	this.attachRestriction('unlink');
	this.attachRestriction('unlink.source');
	this.attachRestriction('unlink.target');
	
	// (userId, doc, fieldNames, modifier, action) => Boolean
	this.deny({
		insert: function(userId, document) {
			collection.validateRestrictions('link', userId, document, undefined, undefined, 'insert');
			collection.validateRestrictions('link.source', userId, document, undefined, undefined, 'insert');
			collection.validateRestrictions('link.target', userId, document, undefined, undefined, 'insert');
		},
		update: function(userId, document, fieldNames, modifier) {
			var _source = lodash.includes(fieldNames, '_source');
			var _target = lodash.includes(fieldNames, '_target');
			if (_source || _target) {
				collection.validateRestrictions('unlink', userId, document, fieldNames, modifier, 'update');
				collection.validateRestrictions('link', userId, document, fieldNames, modifier, 'update');
			}
			if (_source) {
				collection.validateRestrictions('unlink.source', userId, document, fieldNames, modifier, 'update');
				collection.validateRestrictions('link.source', userId, document, fieldNames, modifier, 'update');
			}
			if (_target) {
				collection.validateRestrictions('unlink.target', userId, document, fieldNames, modifier, 'update');
				collection.validateRestrictions('link.target', userId, document, fieldNames, modifier, 'update');
			}
		},
		remove: function(userId, document) {
			collection.validateRestrictions('unlink', userId, document, undefined, undefined, 'remove');
			collection.validateRestrictions('unlink.source', userId, document, undefined, undefined, 'remove');
			collection.validateRestrictions('unlink.target', userId, document, undefined, undefined, 'remove');
		}
	});
};