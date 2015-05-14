/*! MockingBird v1.0.0 2015-05-14 */
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

	_url: null,

	constructor: MockingBird.XMLHttpRequest,

	/**
	 * Mocks an HTTP request that returns the given status, body and headers
	 *
	 * @param {Number} status The HTTP status code
	 * @param {String} body=null The optional body of the HTTP response
	 * @param {Object} headers={} An optional key-value hash of response header names and values
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
		return this._connectionStrategy = new MockingBird.XMLHttpRequest.ConnectionBuilderStrategy(this);
	},

	changeState: function(readyState, status) {
		this.readyState = readyState;
		this.status = status;

		if (this.readyState === this.DONE) {
			this.responseXML = this._parseResponseText();
		}

		this.onreadystatechange();
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
	 * @param {boolean} async=true Whether or not the HTTP request should be a blocking call
	 */
	open: function(method, url, async) {
		this._method = method;
		this._url = url;
		this._async = !!async;
		this.changeState(this.OPENED, 0);
	},

	overrideMimeType: function(mimeType) {
		this._mimeType = mimeType;
	},

	/**
	 * Sends the request to the server
	 * @param {String} data=null The URI encoded HTTP request body to send with the request
	 */
	send: function(data) {
		this._data = data;
		this._connectionStrategy.execute(data);
	}

};

/**
 * This class allows you to build a custom HTTP request lifecycle for an AJAX request
 * @class MockingBird.XMLHttpRequest.ConnectionBuilderStrategy
 * @implements MockingBird.XMLHttpRequest.IConnectionStrategy
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
	 * @member {Array<String>}
	 */
	chunks: null,

	_delayExecution: false,

	_events: null,

	/**
	 * The raw request body sent with the request as a result of invoking {@link MockingBird.XMLHttpRequest#send}
	 * @member {String}
	 */
	requestBody: null,

	/**
	 * The mock AJAX object
	 * @member {MockingBird.XMLHttpRequest}
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
	 * @param {Number} status The HTTP status code
	 * @param {String} body The body of the HTTP response, or the last chunk if simulating a chunked response
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

	connects: function() {
		return this.strategy = new MockingBird.XMLHttpRequest().connects();
	},

	getRequest: function() {
		return this.strategy.xhr;
	},

	matches: function(method, url, async, username, password) {
		return this.method == method.toUpperCase()
		    && this.url == url
		    && this.async == async
		    && this.username == username
		    && this.password == password;
	},

	returns: function(status, body, headers) {
		return this.strategy = new MockingBird.XMLHttpRequest().returns(status, body, headers);
	}

};

/**
 * This class mocks a simple HTTP request that goes through each phase and ends
 * with the given status and response body.
 * @class MockingBird.XMLHttpRequest.SimpleConnectionStrategy
 * @implements MockingBird.XMLHttpRequest.IConnectionStrategy
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
	 * @member {MockingBird.XMLHttpRequest}
	 */
	xhr: null,

	constructor: MockingBird.XMLHttpRequest.SimpleConnectionStrategy,

	/**
	 * Sets the body for this mock request
	 * @param {String} body
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

	destroy: function() {
		if (this.global) {
			this.global.XMLHttpRequest = this.OriginalXMLHttpRequest;
		}

		this.mocks = this.global = this.OriginalXMLHttpRequest = null;
	},

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

	mock: function(method, url, async, username, password) {
		var mock = new MockingBird.XMLHttpRequest.MockBuilder(method, url, async, username, password);

		this.mocks.push(mock);

		return mock;
	}

};

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
	    onReadyStateChange = null;

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
