/*! MockingBird v1.0.2 2015-05-20 */
/**
 * @namespace MockingBird
 */
var MockingBird = {

	/**
	 * Start intercepting calls to <code>new XMLHttpRequest()</code> so you can
	 * use MockingBird for AJAX requests. This overwrites the
	 * <code>XMLHttpRequest</code> property of the <code>global</code> object
	 * so that a {@link MockingBird.XMLHttpRequestProxy} object is returned when
	 * <code>new XMLHttpRequest()</code> is invoked.
	 * <p>
	 * The resulting {@link MockingBird.XMLHttpRequestInterceptor} object allows
	 * your tests to mock specific HTTP requests, and will throw an error if
	 * code attempts to open a connection that has not been mocked. This
	 * effectively turns off network connections via AJAX in the browser while
	 * your tests are running.
	 *
	 * @param {Object} global An object representing the "global context." In web browsers, this would be the <code>window</code> object.
	 * @returns {MockingBird.XMLHttpRequestInterceptor}
	 */
	interceptAjax: function(global) {
		return new MockingBird.XMLHttpRequestInterceptor(global);
	}

};

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

/**
 * This class contains information about the last request made using a mock
 * HTTP request object to make assertions in unit tests easier.
 *
 * @class MockingBird.XMLHttpRequest.RequestInfo
 * @param {MockingBird.XMLHttpRequest} xhr A mock request object
 */
MockingBird.XMLHttpRequest.RequestInfo = function RequestInfo(xhr) {
	/**
	 * The HTTP request method
	 * @member {String} method
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.method = xhr._method;

	/**
	 * URl the last request was sent to
	 * @member {String} url
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.url = xhr._url;

	/**
	 * Whether or not the last request was asynchrounous
	 * @member {boolean} async
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.async = xhr._async;

	/**
	 * Username sent with the last request
	 * @member {String} username
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.username = xhr._username;

	/**
	 * Password sent with the last request
	 * @member {String} password
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.password = xhr._password;

	/**
	 * Data sent in the body of the last request
	 * @member {String|Object} data
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.data = xhr._data;

	/**
	 * The HTTP status code
	 * @member {Number} status
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.status = xhr.status;

	/**
	 * The key-value hash of request headers
	 * @member {Object} requestHeaders
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.requestHeaders = Object.create(xhr._requestHeaders);

	/**
	 * The key-value hash of response headers
	 * @member {Object} responseHeaders
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.responseHeaders = Object.create(xhr._responseHeaders);

	/**
	 * The raw response text from the last request
	 * @member {String} responseText
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.responseText = xhr.responseText;

	/**
	 * The XML document tree parsed from the responseText of the last request
	 * @member {XMLDocument} responseXML
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.responseXML = xhr.responseXML;

	/**
	 * The readyState of the last request
	 * @member {Number} readyState
	 * @memberof MockingBird.XMLHttpRequest.RequestInfo
	 */
	this.readyState = xhr.readyState;
};

MockingBird.XMLHttpRequest.RequestInfo.prototype = {

	constructor: MockingBird.XMLHttpRequest.RequestInfo,

	/**
	 * Gets the value of a request header
	 * @param {String} key The header name
	 * @returns {String} The value of the request header, or null if not found
	 */
	getRequestHeader: function(key) {
		return key in this.requestHeaders ? this.requestHeaders[key] : null;
	},

	/**
	 * Returns true if the given request header was set
	 * @param {String} key The header name
	 * @returns {boolean}
	 */
	hasRequestHeader: function(key) {
		return !!this.getRequestHeader(key);
	},

	/**
	 * Gets the value of a response header
	 * @param {String} key The header name
	 * @returns {String} The value of the response header, or null if not found
	 */
	getResponseHeader: function(key) {
		return key in this.responseHeaders ? this.responseHeaders[key] : null;
	},

	/**
	 * Gets the value of a response header
	 * @param {String} key The header name
	 * @returns {String} The value of the response header, or null if not found
	 */
	hasResponseHeader: function(key) {
		return !!this.getResponseHeader(key);
	},

	/**
	 * Whether or not the request was complete (readyState=4)
	 * @returns {boolean}
	 */
	isComplete: function() {
		return this.readyState === 4;
	},

	/**
	 * Whether or not the HTTP method was GET
	 * @returns {boolean}
	 */
	isGet: function() {
		return (this.method || "").toUpperCase() === "GET";
	},

	/**
	 * Whether or not the HTTP method was DELETE
	 * @returns {boolean}
	 */
	isDelete: function() {
		return (this.method || "").toUpperCase() === "DELETE";
	},

	/**
	 * Whether or not the HTTP method was HEAD
	 * @returns {boolean}
	 */
	isHead: function() {
		return (this.method || "").toUpperCase() === "HEAD";
	},

	/**
	 * Whether or not the HTTP method was POST
	 * @returns {boolean}
	 */
	isPost: function() {
		return (this.method || "").toUpperCase() === "POST";
	},

	/**
	 * Whether or not the HTTP method was PUT
	 * @returns {boolean}
	 */
	isPut: function() {
		return (this.method || "").toUpperCase() === "PUT";
	},

	/**
	 * Was the responding server a [teapot]{@link http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#418}?
	 * @returns {boolean}
	 */
	isTeapot: function() {
		return this.status === 418;
	}

};

/**
 * This class mocks a simple HTTP request that goes through each phase and ends
 * with the given status and response body.
 * @class MockingBird.XMLHttpRequest.SimpleConnectionStrategy
 * @augments MockingBird.XMLHttpRequest.IConnectionStrategy
 * @param {MockingBird.XMLHttpRequest} xhr A mock AJAX object
 */
MockingBird.XMLHttpRequest.SimpleConnectionStrategy = function SimpleConnectionStrategy(xhr) {
	this._headers = {};
	this.xhr = xhr;
};

MockingBird.XMLHttpRequest.SimpleConnectionStrategy.prototype = {

	_body: null,

	_headers: null,

	_status: 200,

	/**
	 * The mock AJAX object
	 * @member {MockingBird.XMLHttpRequest} xhr
	 * @memberof MockingBird.XMLHttpRequest.SimpleConnectionStrategy
	 */
	xhr: null,

	constructor: MockingBird.XMLHttpRequest.SimpleConnectionStrategy,

	/**
	 * Sets the body for this mock request
	 *
	 * @function MockingBird.XMLHttpRequest.SimpleConnectionStrategy#body
	 *
	 * @param {String} body The body of the HTTP response
	 * @returns {MockingBird.XMLHttpRequest.SimpleConnectionStrategy}
	 */
	/**
	 * Sets the body for this mock request
	 *
	 * @function MockingBird.XMLHttpRequest.SimpleConnectionStrategy#body
	 *
	 * @param {Object} body The body of the HTTP response as an object that will get stringified using <code>JSON.stringify</code>
	 * @returns {MockingBird.XMLHttpRequest.SimpleConnectionStrategy}
	 */
	body: function(body) {
		if (body === undefined || body === null) {
			this._body = null;
		}
		else {
			this._body = typeof body == "object" ? JSON.stringify(body) : String(body);
		}

		return this;
	},

	/**
	 * @inheritdoc
	 */
	execute: function(requestBody) {
		if (this.xhr.readyState != this.xhr.OPENED) {
			this.xhr.changeState(this.xhr.OPENED, 0);
		}

		this.xhr.setResponseHeaders(this._headers);
		this.xhr.changeState(this.xhr.HEADERS_RECEIVED, this._status);
		this.xhr.responseText = this._body;
		this.xhr.changeState(this.xhr.LOADING, this._status);
		this.xhr.changeState(this.xhr.DONE, this._status);
	},

	/**
	 * Sets the headers for this request. Multiple calls to this method perform an unsafe merge on the previous headers.
	 * @param {Object} headers An object of key-value pairs for the HTTP headers
	 * @returns {MockingBird.XMLHttpRequest.SimpleConnectionStrategy}
	 */
	headers: function(headers) {
		for (var key in headers) {
			if (headers.hasOwnProperty(key)) {
				this._headers[key] = headers[key];
			}
		}

		return this;
	},

	/**
	 * Sets the status for this request.
	 * @param {Number} status The HTTP status code
	 * @returns {MockingBird.XMLHttpRequest.SimpleConnectionStrategy}
	 */
	status: function(status) {
		this._status = status;

		return this;
	}

};

/**
 * This class injects MockingBird into a global context object, such as the
 * <code>window</code> object of a Web browser, and returns a
 * {@link MockingBird.XMLHttpRequestProxy} object when
 * <code>new XMLHttpRequest()</code> is invoked.
 *
 * @class MockingBird.XMLHttpRequestInterceptor
 * @implements {MockingBird.XMLHttpRequest.IRequestFactory}
 * @param {Object} global The global context object, such as the <code>window</code> object of a Web browser
 */
MockingBird.XMLHttpRequestInterceptor = function XMLHttpRequestInterceptor(global) {
	if ("XMLHttpRequest" in global) {
		this.OriginalXMLHttpRequest = global.XMLHttpRequest;
		global.XMLHttpRequest = this.getXMLHttpRequestFactory(this);
		this.global = global;
	}
	else {
		throw new Error("No XMLHttpRequest constructor was found in " + Object.prototype.toString.call(global));
	}

	this.mocks = [];
};

MockingBird.XMLHttpRequestInterceptor.prototype = {

	global: null,

	mocks: null,

	OriginalXMLHttpRequest: null,

	constructor: MockingBird.XMLHttpRequestInterceptor,

	/**
	 * Ready this interceptor for garbage collection, and return its global
	 * object back to its normal state.
	 */
	destroy: function() {
		if (this.global) {
			this.global.XMLHttpRequest = this.OriginalXMLHttpRequest;
		}

		this.mocks = this.global = this.OriginalXMLHttpRequest = null;
	},

	/**
	 * Gets a {@link MockingBird.XMLHttpRequestProxy} object that was previously
	 * mocked. While public, this method is called by the
	 * {@link MockingBird.XMLHttpRequestProxy} object when the
	 * [open]{@link MockingBird.XMLHttpRequestProxy#open} method is invoked.
	 *
	 * @throws {MockingBird.XMLHttpRequestMockNotFoundError}
	 * @param {String} method The HTTP method for the mock request (GET, POST, PUT, DELETE, HEAD)
	 * @param {String} url The URL the mock request will get sent to
	 * @param {boolean} [async=true] Whether or not the mock request is marked as asynchronous. Note: The mock gets executed synchronously anyhow
	 * @param {String} [username=null] The username sent with the plain text authentication
	 * @param {String} [password=null] The password sent with the plain text authentication
	 * @returns {MockingBird.XMLHttpRequestProxy}
	 */
	getRequest: function(method, url, async, username, password) {
		var i = this.mocks.length;

		async = typeof async === "boolean" ? async : true;

		while (i--) {
			if (this.mocks[i].matches(method, url, async, username, password)) {
				return this.mocks[i].getRequest();
			}
		}

		throw new MockingBird.XMLHttpRequestMockNotFoundError(method, url, async, username, password);
	},

	getXMLHttpRequestFactory: function(requestFactory) {
		return function XMLHttpRequest() {
			return new MockingBird.XMLHttpRequestProxy(requestFactory);
		};
	},

	/**
	 * Returns a {@link MockingBird.XMLHttpRequest.MockBuilder} object allowing
	 * you to mock a request to a URL.
	 *
	 * @param {String} method The HTTP method for the mock request (GET, POST, PUT, DELETE, HEAD)
	 * @param {String} url The URL the mock request will get sent to
	 * @param {boolean} [async=true] Whether or not the mock request is marked as asynchronous. Note: The mock gets executed synchronously anyhow
	 * @param {String} [username=null] The username sent with the plain text authentication
	 * @param {String} [password=null] The password sent with the plain text authentication
	 * @returns {MockingBird.XMLHttpRequest.MockBuilder}
	 */
	mock: function(method, url, async, username, password) {
		var mock = new MockingBird.XMLHttpRequest.MockBuilder(method, url, async, username, password);

		this.mocks.push(mock);

		return mock;
	}

};

/**
 * Exception thrown when no mock was found for the given connection information
 *
 * @class MockingBird.XMLHttpRequestMockNotFoundError
 * @extends Error
 * @param {String} method The HTTP method for the mock request (GET, POST, PUT, DELETE, HEAD)
 * @param {String} url The URL the mock request will get sent to
 * @param {boolean} async Whether or not the mock request is marked as asynchronous. Note: The mock gets executed synchronously anyhow
 * @param {String} username The username sent with the plain text authentication
 * @param {String} password The password sent with the plain text authentication
 */
MockingBird.XMLHttpRequestMockNotFoundError = function XMLHttpRequestMockNotFoundError(method, url, async, username, password) {
	var error = new Error("No mock registered for " + method + " " + url + " (async: " + async + "; username: " + username + "; password: " + password + ")");
	error.name = "MockingBird.XMLHttpRequestMockNotFoundError";
	return error;
};

/**
 * This class acts as a proxy to the native XMLHttpRequest object so that code
 * under test which instantiates AJAX objects via
 * <code>new XMLHttpRequest()</code> does not attempt to make actual HTTP
 * requests. This allows you to unit test applications and mock the responses
 * without dependency injection.
 *
 * @class MockingBird.XMLHttpRequestProxy
 * @param {MockingBird.XMLHttpRequest.IRequestFactory} requestFactory The factory object that returns objects implementing the XMLHttpRequest interface
 */
MockingBird.XMLHttpRequestProxy = function XMLHttpRequestProxy(requestFactory) {

	var xhr = null,
	    onReadyStateChange = function() {};

	Object.defineProperty(this, "onreadystatechange", {
		get: function() {
			return onReadyStateChange;
		},
		set: function(value) {
			onReadyStateChange = value;

			if (xhr) {
				xhr.onreadystatechange = value;
			}
		}
	});

	Object.defineProperty(this, "readyState", {
		get: function() {
			return xhr ? xhr.readyState : 0;
		}
	});

	Object.defineProperty(this, "response", {
		get: function() {
			return xhr ? xhr.response : null;
		}
	});

	Object.defineProperty(this, "responseText", {
		get: function() {
			return xhr ? xhr.responseText : null;
		}
	});

	Object.defineProperty(this, "responseType", {
		get: function() {
			return xhr ? xhr.responseType : null;
		}
	});

	Object.defineProperty(this, "responseXML", {
		get: function() {
			return xhr ? xhr.responseXML : null;
		}
	});

	Object.defineProperty(this, "status", {
		get: function() {
			return xhr ? xhr.status : 0;
		}
	});

	Object.defineProperty(this, "xhr", {
		get: function() {
			return xhr;
		}
	});

	this.abort = function() {
		xhr.abort();
	};

	this.getAllResponseHeaders = function() {
		return xhr.getAllResponseHeaders();
	};

	this.getResponseHeader = function(key) {
		return xhr.getResponseHeader(key);
	};

	this.open = function(method, url, async, user, password) {
		xhr = requestFactory.getRequest(method, url, async, user, password);
		xhr.onreadystatechange = onReadyStateChange;
		xhr.open(method, url, async, user, password);
	};

	this.overrideMimeType = function(mimeType) {
		xhr.overrideMimeType(mimeType);
	};

	this.send = function() {
		if (arguments.length === 1) {
			xhr.send(arguments[0]);
		}
		else {
			xhr.send(null);
		}
	};

	this.setRequestHeader = function(key, value) {
		xhr.setRequestHeader(key, value);
	};

};

MockingBird.XMLHttpRequestProxy.prototype = {

	constructor: MockingBird.XMLHttpRequestProxy,

	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4

};
