// ()
Mongo.Collection.prototype.attachGraph = function() {
	if (this.isGraph) throw new Meteor.Error('Collection '+this._name+' is already graph.');
	this.isGraph = true;
	
	var collection = this;
	
	this.attachSchema(
		new SimpleSchema({
			_source: { type: Shuttler.Ref.Schema },
			_target: { type: Shuttler.Ref.Schema }
		})
	);
	
	this.link = {};
	this.links = {};
	
	// (source: Document|Ref, target: Document|Ref, customFields: Object, callback?: Function) => id: String
	this.link.insert = function(source, target, customFields, callback) {
		return collection.insert(lodash.merge(
			{ _source: Shuttler.Ref.new(source), _target: Shuttler.Ref.new(target) }
			,customFields
		), callback);
	};
	
	// (link: Document|Ref|String, source: Document|Ref, target: Document|Ref, customUpdateQuery: Object, callback?: Function) => count: Number
	this.link.update = function(link, source, target, customUpdateQuery, callback) {
		return collection.update((typeof(link)=='string'?link:Shuttler.Ref.soft(link)._id),
			lodash.merge(
				{ $set: lodash.merge(Shuttler.Ref.new(source, '_source'), Shuttler.Ref.new(target, '_target')) },
				customUpdateQuery
			), 
		callback);
	};
	
	// (link: Document|Ref|String, source: Document|Ref, customUpdateQuery: Object, callback?: Function) => count: Number
	this.link.update.source = this.link.update.from = function(link, source, target, customUpdateQuery, callback) {
		return collection.update((typeof(link)=='string'?link:Shuttler.Ref.soft(link)._id),
			lodash.merge(
				{ $set: Shuttler.Ref.new(source, '_source') },
				customUpdateQuery
			), 
		callback);
	};
	
	// (link: Document|Ref|String, target: Document|Ref, customUpdateQuery: Object, callback?: Function) => count: Number
	this.link.update.target = this.link.update.to = function(link, source, target, customUpdateQuery, callback) {
		return collection.update((typeof(link)=='string'?link:Shuttler.Ref.soft(link)._id),
			lodash.merge(
				{ $set: Shuttler.Ref.new(target, '_target') },
				customUpdateQuery
			), 
		callback);
	};
	
	// (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined
	this.link.find = this.link.findOne = this.links.findOne = function(source, target, query, options) {
		return collection.findOne(lodash.merge(
			Shuttler.Ref.new(source, '_source'), Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (target: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined
	this.link.find.to = this.link.find.target = function(target, query, options) {
		return collection.findOne(lodash.merge(
			Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (source: Document|Ref|(id: String), query: Object, options: Object) => Document|undefined
	this.link.find.from = this.link.find.source = function(source, query, options) {
		return collection.findOne(lodash.merge(
			Shuttler.Ref.new(source, '_source'), query
		), options);
	};
	
	// (source: Document|Ref|(id: String), target: Document|Ref|(id: String), query: Object, options: Object) => Cursor
	this.links.find = function(source, target, query, options) {
		return collection.find(lodash.merge(
			Shuttler.Ref.new(source, '_source'), Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (target: Document|Ref|(id: String), query: Object, options: Object) => Cursor
	this.links.find.to = this.links.find.target = function(target, query, options) {
		return collection.find(lodash.merge(
			Shuttler.Ref.new(target, '_target'), query
		), options);
	};
	
	// (source: Document|Ref|(id: String), query: Object, options: Object) => Cursor
	this.links.find.from = this.links.find.source = function(source, query, options) {
		return collection.find(lodash.merge(
			Shuttler.Ref.new(source, '_source'), query
		), options);
	};
	
	// (handler: (userId, unlinked?, linked, fieldNames, modifier, options) => void, options?)
	this.after.link = function(handler, options) {
		collection.after.update(function(userId, doc, fieldNames, modifier, options) {
			this.sourceChanged = !lodash.isEqual(this.previous._source, doc._source);
			this.targetChanged = !lodash.isEqual(this.previous._target, doc._target);
			if (this.sourceChanged || this.targetChanged) {
				this.action = 'update';
				handler.call(this, userId, collection._transform(this.previous), collection._transform(doc), fieldNames, modifier, options);
			}
		}, options);
		collection.after.insert(function(userId, doc) {
			this.sourceChanged = true;
			this.targetChanged = true;
			this.action = 'insert';
			handler.call(this, userId, undefined, collection._transform(doc));
		});
	};
	
	// (handler: (userId, unlinked, linked?, fieldNames?, modifier?, options?) => void, options?)
	this.after.unlink = function(handler, options) {
		collection.after.update(function(userId, doc, fieldNames, modifier, options) {
			this.sourceChanged = !lodash.isEqual(this.previous._source, doc._source);
			this.targetChanged = !lodash.isEqual(this.previous._target, doc._target);
			if (this.sourceChanged || this.targetChanged) {
				this.action = 'update';
				handler.call(this, userId, collection._transform(this.previous), collection._transform(doc), fieldNames, modifier, options);
			}
		}, options);
		collection.after.remove(function(userId, doc) {
			this.sourceChanged = true;
			this.targetChanged = true;
			this.action = 'remove';
			handler.call(this, userId, collection._transform(doc), undefined);
		});
	};
	
	// (handler: (userId, unlinked?, linked, fieldNames?, modifier?, options?) => void, options?)
	this.after.link.source = function(handler, options) {
		collection.after.link(function(userId, unlinked, linked, fieldNames, modifier, options) {
			if (this.sourceChanged) {
				handler.apply(this, arguments);
			}
		}, options);
	};
	
	// (handler: (userId, unlinked?, linked, fieldNames?, modifier?, options?) => void, options?)
	this.after.link.target = function(handler, options) {
		collection.after.link(function(userId, unlinked, linked, fieldNames, modifier, options) {
			if (this.targetChanged) {
				handler.apply(this, arguments);
			}
		}, options);
	};
	
	// (handler: (userId, unlinked, linked?, fieldNames?, modifier?, options?) => void, options?)
	this.after.unlink.source = function(handler, options) {
		collection.after.unlink(function(userId, unlinked, linked, fieldNames, modifier, options) {
			if (this.sourceChanged) {
				handler.apply(this, arguments);
			}
		}, options);
	};
	
	// (handler: (userId, unlinked, linked?, fieldNames?, modifier?, options?) => void, options?)
	this.after.unlink.target = function(handler, options) {
		collection.after.unlink(function(userId, unlinked, linked, fieldNames, modifier, options) {
			if (this.targetChanged) {
				handler.apply(this, arguments);
			}
		}, options);
	};
	
	this.helpers({
		source: function() {
			return Shuttler.Ref(this._source);
		},
		target: function() {
			return Shuttler.Ref(this._target);
		}
	});
	
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

// (direction: Shuttler.GraphDirectionSchema, link: Document|Ref) => Object
Shuttler.getSelectorByDirection = function(direction, link) {
	return direction=='link'?{_id:Shuttler.Ref.new(link).id}:Shuttler.Ref.new(link,'_'+direction);
};

// (direction: Shuttler.GraphDirectionSchema, link: Document) => Ref
Shuttler.getRefByDirection = function(direction, link) {
	return direction=='link'?link.Ref():link['_'+direction];
};

// (direction: Shuttler.GraphDirectionSchema, link: Document) => Document
Shuttler.getDocumentByDirection = function(direction, link) {
	return direction=='link'?link:link[direction]();
};

Shuttler.GraphSidesSchema = new SimpleSchema({
	source: {
		type: String,
		allowedValues: ["source", "target"],
	},
	target: {
		type: String,
		optional: true,
		autoValue: function() {
			return Shuttler.GraphSidesSchema._inverter[this.field('source').value];
		},
	}
});
Shuttler.GraphSidesSchema._inverter = {'source':'target','target':'source'};

Shuttler.GraphDirectionSchema = new SimpleSchema({
	source: {
		type: String,
		allowedValues: ["source", "target", "link"]
	},
	target: {
		type: String,
		allowedValues: ["source", "target", "link"],
		optional: true,
		custom: function() {
			if (this.field('source') == this.value) return 'notAllowed';
		}
	}
});

Shuttler.GraphDirectionsSchema = new SimpleSchema({
	sources: {
		type: [String],
		allowedValues: ["source", "target", "link"],
		minCount: 1
	},
	targets: {
		type: [String],
		allowedValues: ["source", "target", "link"],
		minCount: 1,
		custom: function() {
			var sources = this.field('sources');
			if (lodash.intersection(sources, this.value).length) return 'notAllowed';
		}
	}
});