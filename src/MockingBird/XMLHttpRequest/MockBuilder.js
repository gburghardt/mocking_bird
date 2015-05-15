/**
 * This class allows you to mock a request to another URL with specific
 * connection settings.
 *
 * @class MockingBird.XMLHttpRequest.MockBuilder
 * @augments MockingBird.XMLHttpRequest.IMockBuilder
 *
 * @param {String} method The HTTP method for the mock request (GET, POST, PUT, DELETE, HEAD)
 * @param {String} url The URL the mock request will get sent to
 * @param {boolean} [async=true] Whether or not the mock request is marked as asynchronous. Note: The mock gets executed synchronously anyhow
 * @param {String} [username=null] The username sent with the plain text authentication
 * @param {String} [password=null] The password sent with the plain text authentication
 */
MockingBird.XMLHttpRequest.MockBuilder = function MockBuilder(method, url, async, username, password) {
	this.method = method.toUpperCase();
	this.url = url;
	this.async = typeof async === "boolean" ? async : true;
	this.username = username || null;
	this.password = password || null;
};

MockingBird.XMLHttpRequest.MockBuilder.prototype = {

	async: true,

	method: null,

	password: null,

	strategy: null,

	url: null,

	username: null,

	constructor: MockingBird.XMLHttpRequest.MockBuilder,

	/**
	 * Create a mock request that receives a chunked reponse from
	 * the server, including headers. The last chunk is delivered with
	 * readyState=4, ending the connection.
	 *
	 * @function MockingBird.XMLHttpRequest.MockBuilder#chunks
	 *
	 * @param {Number} status The HTTP status code sent from the server
	 * @param {Array<String>} chunks An array of strings representing the chunked response
	 * @param {Object} [headers={}] The HTTP response headers
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */

	/**
	 * Create a mock request that receives a chunked reponse from
	 * the server, including headers. The last chunk is delivered with
	 * readyState=4, ending the connection.
	 *
	 * @function MockingBird.XMLHttpRequest.MockBuilder#chunks
	 *
	 * @param {Number} status The HTTP status code sent from the server
	 * @param {Array<Object>} chunks An array of objects that will be stringified by <code>JSON.stringify</code> as the chunked response
	 * @param {Object} [headers={}] The HTTP response headers
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	chunks: function(status, chunks, headers) {
		if (!chunks || !chunks.length) {
			throw new Error("Missing or empty argument: chunks");
		}

		var strategy = this.connects().receivesHeaders(status, headers || {});

		for (var i = 0, length = chunks.length - 1; i < length; i++) {
			strategy.receivesChunk(status, chunks[i]);
		}

		if (length > -1) {
			strategy.done(status, chunks[length]);
		}

		return strategy;
	},

	/**
	 * Create a mock request that has a custom lifecycle. Connects to the server.
	 *
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	connects: function() {
		return this.strategy = new MockingBird.XMLHttpRequest().connects();
	},

	/**
	 * @inheritdoc
	 */
	getRequest: function() {
		return this.strategy.xhr;
	},

	/**
	 * @inheritdoc
	 */
	matches: function(method, url, async, username, password) {
		return this.method == method.toUpperCase()
		    && this.url == url
		    && this.async == async
		    && this.username == username
		    && this.password == password;
	},

	/**
	 * Create a mock request that returns a canned response from the server
	 *
	 * @function MockingBird.XMLHttpRequest.MockBuilder#returns
	 *
	 * @param {Number} status The HTTP status code returned by the server
	 * @param {String} [body=null] The body of the HTTP response
	 * @returns {MockingBird.XMLHttpRequest.SimpleConnectionStrategy}
	 */

	/**
	 * Create a mock request that returns a canned response from the server
	 *
	 * @function MockingBird.XMLHttpRequest.MockBuilder#returns
	 *
	 * @param {Number} status The HTTP status code returned by the server
	 * @param {Object} [body=null] The body of the HTTP response as an object, which gets stringified using <code>JSON.stringify</code>
	 * @returns {MockingBird.XMLHttpRequest.SimpleConnectionStrategy}
	 */
	returns: function(status, body, headers) {
		return this.strategy = new MockingBird.XMLHttpRequest().returns(status, body, headers);
	}

};
