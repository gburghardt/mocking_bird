/**
 * This class allows you to build a custom HTTP request lifecycle for an AJAX request
 * @class MockingBird.XMLHttpRequest.ConnectionBuilderStrategy
 * @augments MockingBird.XMLHttpRequest.IConnectionStrategy
 * @param {MockingBird.XMLHttpRequest} xhr The mock AJAX object
 */
MockingBird.XMLHttpRequest.ConnectionBuilderStrategy = function ConnectionBuilderStrategy(xhr) {
	this.chunks = [];
	this._events = [];
	this.xhr = xhr;
};

MockingBird.XMLHttpRequest.ConnectionBuilderStrategy.prototype = {

	/**
	 * An array representing each response chunk from the server
	 * @member {Array<String>} chunks
	 * @memberof MockingBird.XMLHttpRequest.ConnectionBuilderStrategy
	 */
	chunks: null,

	_delayExecution: false,

	_events: null,

	/**
	 * The raw request body sent with the request as a result of invoking {@link MockingBird.XMLHttpRequest#send}
	 * @member {String} requestBody
	 * @memberof MockingBird.XMLHttpRequest.ConnectionBuilderStrategy
	 */
	requestBody: null,

	/**
	 * The mock AJAX object
	 * @member {MockingBird.XMLHttpRequest} xhr
	 * @memberof MockingBird.XMLHttpRequest.ConnectionBuilderStrategy
	 */
	xhr: null,

	constructor: MockingBird.XMLHttpRequest.ConnectionBuilderStrategy,

	_addChunk: function(chunk) {
		return this.chunks.push(this._chunkToString(chunk)) - 1;
	},

	_addEvent: function(event) {
		if (this._delayExecution) {
			event.call(this, this.xhr);
		}
		else {
			this._events.push(event);
		}
	},

	/**
	 * This request opens a connection to the server. This should be the first
	 * method you call on this strategy object, unless you want this mock to
	 * delay execution.
	 *
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	connects: function() {
		this._addEvent(function(xhr) {
			xhr.changeState(xhr.OPENED, 0);
		});

		return this;
	},

	/**
	 * Delay execution of this strategy so tests can control exactly when each
	 * phase of the request is executed. This allows your tests to make
	 * assertions mid-request.
	 *
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	delayExecution: function() {
		this._delayExecution = true;

		return this;
	},

	/**
	 * This connection disconnects from the server. Use this when you want to
	 * simulate connection problems in your unit tests.
	 *
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	disconnects: function() {
		this._addEvent(function(xhr) {
			xhr.resetRequest();
			xhr.changeState(xhr.UNSENT, 0);
		});

		return this;
	},

	/**
	 * This connection is done. No more headers or data will be sent.
	 *
	 * @function MockingBird.XMLHttpRequest.ConnectionBuilderStrategy#done
	 *
	 * @param {Number} status The HTTP status code
	 * @param {String} body The body of the HTTP response, or the last chunk if simulating a chunked response
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	/**
	 * This connection is done. No more headers or data will be sent.
	 *
	 * @function MockingBird.XMLHttpRequest.ConnectionBuilderStrategy#done
	 *
	 * @param {Number} status The HTTP status code
	 * @param {Object} body An object representing the body or the last chunk of the response. Gets stringified using <code>JSON.stringify</code>
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	done: function(status, body) {
		if (body && this.chunks.length) {
			this._addChunk(body);
		}

		this._addEvent(function(xhr) {
			if (this.chunks.length) {
				xhr.responseText = this.joinChunks();
			}
			else {
				xhr.responseText = this._chunkToString(body);
				xhr.changeState(xhr.LOADING, status);
			}

			xhr.changeState(xhr.DONE, status);
		});
	},

	/**
	 * @inheritdoc
	 */
	execute: function(requestBody) {
		this.requestBody = this._chunkToString(requestBody);

		if (this._delayExecution) {
			// A unit test will control the execution of this request
			return;
		}

		if (!this._events.length) {
			throw new Error("No request lifecycle events have been added to this strategy");
		}

		for (var i = 0, length = this._events.length; i < length; i++) {
			this._events[i].call(this, this.xhr);
		}
	},

	joinChunks: function() {
		return this.chunks.join("");
	},

	/**
	 * This connection receives the following chunked response from the server.
	 * Use this to simulate a chunked response from the server. A state change
	 * in the AJAX object is triggered each time this method is called.
	 *
	 * @param {Number} status The HTTP status code
	 * @param {String} chunk The partial HTTP response text
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	receivesChunk: function(status, chunk) {
		var i = this._addChunk(chunk);

		this._addEvent(function(xhr) {
			xhr.responseText = (xhr.responseText || "") + this.chunks[i];
			xhr.changeState(xhr.LOADING, status || 200);
		});

		return this;
	},

	/**
	 * This connection receives the following response headers from the server
	 *
	 * @param {Number} status The HTTP status code
	 * @param {Object} headers A key-value pair of response header names and values
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	receivesHeaders: function(status, headers) {
		this._addEvent(function(xhr) {
			xhr.setResponseHeaders(headers || {});
			xhr.changeState(xhr.HEADERS_RECEIVED, status || 200);
		});

		return this;
	},

	_chunkToString: function(chunk) {
		if (chunk === undefined || chunk === null) {
			return null;
		}

		return typeof chunk === "object" ? JSON.stringify(chunk) : String(chunk);
	}

};
