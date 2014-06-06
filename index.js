module.exports = (function() {
"use strict";
var arrayMap = require('mout/array/map'),
	when = require('when'),
	whenNode = require('when/node/function'),
	guard = require('when/guard');

var B = function(errorHandler, elementHander, resultHandler, emptyHandler) {
	this._emptyHandler = emptyHandler;
	this._errorHandler = errorHandler;
	this._handler = elementHander;
	this._resultHandler = resultHandler;
	this._datas = [];
	this._errors = [];
	this._started = false;
};

B.prototype._handlerWrapper = function(element, next) {

	var resultHandler = this._resultHandler;
	this._handler(element, function(err, result) {
		if (this._errors.length) {
			return this._errors.push(element);
		}
		if (err) {
			this._errors.push(element);
			return next(err);
		}
		resultHandler(result);
		next(err, result);
	}.bind(this));

};

B.prototype._process = function() {
	if (!this._started) { return; }
	var handlerWrapper = this._handlerWrapper.bind(this);
	var mapper = guard(guard.n(1), function(element) {
		return whenNode.call(handlerWrapper, element);
	});
	if (this._datas.length === 1) {
		when.all(arrayMap(this._datas[0], mapper)).done(
			this._successFunc.bind(this),
			this._errorHandler
		);
	}
};

B.prototype._successFunc = function() {
	this._datas.shift();
	if (this._datas.length) {
		return this._process();
	}
	this._emptyHandler();
};

B.prototype.add = function(data) {
	if (this._datas.length > 1) {
		return this._datas[1].push(data);
	}
	if ((!this._started) && (this._datas.length > 0)) {
		this._datas[this._datas.length - 1].push(data);
	} else {
		this._datas.push([data]);
	}
	this._process();
};

B.prototype.start = function() {
	this._started = true;
	this._process();
};

return B;

}());
