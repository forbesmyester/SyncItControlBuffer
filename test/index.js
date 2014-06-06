(function() {
"use strict";

var expect = require('../node_modules/expect.js/expect.js'),
	Buffer = require('../index');

describe('can run a buffer', function() {

	var fullSuccessElementHandler = function(value, next) {
		/* global setTimeout: false */
		setTimeout(function() {
			next(null, "A" + value);
		}, 1);
	};

	var failOnFail = function() { expect().fail(); };

	it('will fire for one element (after start)', function(done) {

		var results = [];

		var b = new Buffer(
			failOnFail,
			fullSuccessElementHandler,
			function(result) { results.push(result); },
			function() {
				expect(results).to.eql(['A0']);
				done();
			}
		);

		b.start();
		b.add(0);

	});

	it('will fire for every element (before start)', function(done) {

		var results = [];

		var b = new Buffer(
			failOnFail,
			fullSuccessElementHandler,
			function(result) { results.push(result); },
			function() {
				expect(results).to.eql(['A0', 'A1', 'A2', 'A3', 'A4']);
				done();
			}
		);

		for (var i=0; i<5; i++) {
			b.add(i);
		}

		b.start();

	});

	it('will fire for every element', function(done) {

		var results = [];

		var b = new Buffer(
			function(err) {
				expect(results).to.eql(['B0', 'B1', 'B2']);
				expect(err).to.equal(33);
				done();
			},
			function(element, next) {
				var r = 'B' + element;
				if (element == 3) {
					return next(33, r);
				}
				next(null, r);
			},
			function(result) { results.push(result); },
			failOnFail
		);

		b.start();
		for (var i=0; i<5; i++) {
			b.add(i);
		}

	});

	it('will continue after stopped', function(done) {

		var results = [];
		var count = 0;

		var b = new Buffer(
			failOnFail,
			fullSuccessElementHandler,
			function(result) { results.push(result); },
			function() {
				count++;
				if (count == 1) {
					expect(results).to.eql(['A0', 'A1', 'A2', 'A3', 'A4']);
					b.add(5);
					b.add(6);
					b.add(7);
					return;
				}
				expect(count).to.equal(2);
				expect(results).to.eql(['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']);
				done();
			}
		);

		b.start();
		for (var i=0; i<5; i++) {
			b.add(i);
		}

	});

});

}());
