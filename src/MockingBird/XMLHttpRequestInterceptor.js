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
