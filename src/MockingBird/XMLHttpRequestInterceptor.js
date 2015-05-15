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
