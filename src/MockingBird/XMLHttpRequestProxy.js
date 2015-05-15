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
