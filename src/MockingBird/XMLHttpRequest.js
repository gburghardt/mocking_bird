/**
 * This class mocks the native XMLHttpRequest object.
 *
 * @class XMLHttpRequest
 * @memberof MockingBird
 */
MockingBird.XMLHttpRequest = function XMLHttpRequest() {
	this._requestHeaders = {};
	this._responseHeaders = {};
};

MockingBird.XMLHttpRequest.prototype = {

	_async: true,

	_connectionStrategy: null,

	_method: null,

	_requestHeaders: null,

	_responseHeaders: null,

	_data: null,

	_password: null,

	_url: null,

	_username: null,

	constructor: MockingBird.XMLHttpRequest,

	/**
	 * Mocks an HTTP request that returns the given status, body and headers
	 *
	 * @param {Number} status The HTTP status code
	 * @param {String} [body=null] The optional body of the HTTP response
	 * @param {Object} [headers={}] An optional key-value hash of response header names and values
	 * @returns {MockingBird.XMLHttpRequest.SimpleConnectionStrategy}
	 */
	returns: function(status, body, headers) {
		return this._connectionStrategy = new MockingBird.XMLHttpRequest.SimpleConnectionStrategy(this)
			.status(status)
			.body(body || null)
			.headers(headers || {});
	},

	/**
	 * Mocks an HTTP request and provides a fluent API for configuring each phase of the request
	 *
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	connects: function() {
		return this._connectionStrategy = new MockingBird.XMLHttpRequest.ConnectionBuilderStrategy(this).connects();
	},

	changeState: function(readyState, status) {
		this.readyState = readyState;
		this.status = status;

		if (this.readyState === this.DONE) {
			this.responseXML = this._parseResponseText();
		}

		this.onreadystatechange();
	},

	/**
	 * Delays the execution of this request so unit tests can control the
	 * request life cycle and make assertions in between each phase.
	 *
	 * @returns {MockingBird.XMLHttpRequest.ConnectionBuilderStrategy}
	 */
	delayExecution: function() {
		return this._connectionStrategy = new MockingBird.XMLHttpRequest.ConnectionBuilderStrategy(this).delayExecution();
	},

	/**
	 * Get a key-value hash of all request headers
	 * @returns {Object}
	 */
	getAllRequestHeaders: function() {
		return this._requestHeaders;
	},

	/**
	 * Returns an object containing information about the last request.
	 *
	 * @returns {MockingBird.XMLHttpRequest.RequestInfo}
	 */
	getLastRequest: function() {
		return new MockingBird.XMLHttpRequest.RequestInfo(this);
	},

	_parseResponseText: function() {
		var dom = null, parser, parseErrorNamespace;

		if (this.responseText) {
			try {
				parser = new DOMParser();
				dom = parser.parseFromString(this.responseText, "application/xml");;

				if (dom.getElementsByTagName("parsererror").length > 0) {
					dom = null;
				}
			}
			catch (error) {
				dom = null;
			}
		}

		return dom;
	},

	resetRequest: function() {
		this.readyState = this.UNSENT;
		this.status = 0;
		this.responseText = null;
		this.responseXML = null;
	},


	/**
	 * The HTTP request is complete
	 * @constant {Number}
	 * @default
	 */
	DONE: 4,

	/**
	 * The connection has been opened, and response headers and status are available
	 * @constant {Number}
	 * @default
	 */
	HEADERS_RECEIVED: 2,

	/**
	 * The connection has been opened and data is being received
	 * @constant {Number}
	 * @default
	 */
	LOADING: 3,

	/**
	 * The connection has been opened
	 * @constant {Number}
	 * @default
	 */
	OPENED: 1,

	/**
	 * The connection has not been opened, or the request has been aborted
	 * @constant {Number}
	 * @default
	 */
	UNSENT: 0,

	/**
	 * The current state of the connection
	 * @member {Number}
	 * @default
	 */
	readyState: 0,

	/**
	 * The raw response text from the server
	 * @member {String}
	 * @default
	 */
	responseText: null,

	/**
	 * The response text from the server parsed as XML
	 * @member {XMLDocument}
	 * @default
	 */
	responseXML: null,

	/**
	 * The HTTP status code
	 * @member {Number}
	 * @default
	 */
	status: 0,

	/**
	 * Event handler invoked when the state of the connection has changed
	 */
	onreadystatechange: function() {},

	/**
	 * Abort the current request
	 */
	abort: function() {
		this.resetRequest();
		this.changeState(this.UNSENT, 0);
	},

	/**
	 * Get a key-value hash of all response headers
	 * @returns {Object}
	 */
	getAllResponseHeaders: function() {
		return this._responseHeaders;
	},

	/**
	 * Get a response header by name
	 * @param {String} name The HTTP response header name
	 * @returns {String}
	 */
	getResponseHeader: function(name) {
		return this._responseHeaders.hasOwnProperty(name)
			? this._responseHeaders[name]
			: null;
	},

	/**
	 * Get a request by name
	 * @param {String} name The HTTP request header name
	 * @returns {String}
	 */
	getRequestHeader: function(name) {
		return this._requestHeaders.hasOwnProperty(name)
			? this._requestHeaders[name]
			: null;
	},

	setResponseHeaders: function(headers) {
		this._responseHeaders = headers;
	},

	/**
	 * Sets a request header by name
	 * @param {String} name Header name
	 * @param {String} value Header value
	 */
	setRequestHeader: function(name, value) {
		this._requestHeaders[name] = value;
	},

	/**
	 * Opens the connection
	 * @param {String} method The HTTP method, or verb, to be used for this request (GET, POST, HEAD, PUT, DELETE)
	 * @param {String} url The URL to send the request to
	 * @param {boolean} [async=true] Whether or not the HTTP request should be a blocking call
	 * @param {String} [username=null] The username to send with the request
	 * @param {String} [password=null] The password to send with the request
	 */
	open: function(method, url, async, username, password) {
		this._method = method;
		this._url = url;
		this._async = !!async;
		this._username = username;
		this._password = password;
		this.changeState(this.OPENED, 0);
	},

	overrideMimeType: function(mimeType) {
		this._mimeType = mimeType;
	},

	/**
	 * Sends the request to the server
	 * @param {String} [data=null] The URI encoded HTTP request body to send with the request
	 */
	send: function(data) {
		this._data = data;
		this._connectionStrategy.execute(data);
	}

};
