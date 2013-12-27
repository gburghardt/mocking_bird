MockingBird.XMLHttpRequest = function XMLHttpRequest() {
	this._requestHeaders = {};
	this._responseHeaders = {};
};

/*
TODO: Create a URL-matching factory method

MockingBird.XMLHttpRequest.OrigXMLHttpRequest = null;
MockingBird.XMLHttpRequest.enabledCallback = null;

MockingBird.XMLHttpRequest.disableNetworkConnections = function disableNetworkConnections(callback, context) {
	this.OrigXMLHttpRequest = window.XMLHttpRequest;
	window.XMLHttpRequest = MockingBird.XMLHttpRequest;

	if (callback || context) {
		this.enabledCallback = {
			context: context,
			callback: callback
		};
	}
};

MockingBird.XMLHttpRequest.enableNetworkConnections = function enableNetworkConnections() {
	window.XMLHttpRequest = this.OrigXMLHttpRequest;

	if (this.enabledCallback) {
		this.enabledCallback.callback.call(this.enabledCallback.context);
	}
};
*/

MockingBird.XMLHttpRequest.prototype = {

	_async: true,

	_body: "",

	_status: 200,

	_method: null,

	_requestHeaders: null,

	_responseHeaders: null,

	_data: null,

	_waitTime: null,

	_url: null,

	constructor: MockingBird.XMLHttpRequest,

	// Test setup methods

	andWaits: function andWaits(waitTime) {
		// TODO: Call setTimeout(...) when sending request
		this._waitTime = waitTime;
		return this;
	},

	returnsStatus: function returnsStatus(endingStatus) {
		this._status = endingStatus;
		return this;
	},

	returnsBody: function returnsBody(body) {
		this._body = body;
		return this;
	},

	returnsHeaders: function returnsHeaders(headers) {
		this._responseHeaders.merge(headers);
		return this;
	},

	sendsHeaders: function sendsHeaders(headers) {
		this._requestHeaders.merge(headers);
		return this;
	},

	_changeState: function _changeState(readyState, status) {
		this.readyState = readyState;
		this.status = status;

		if (this.status === 4) {
			this.responseText = this._body;
			this.responseXML = this._parseResponseText();
		}

		this.onreadystatechange();
	},

	_parseResponseText: function _parseResponseText() {
		try {
			var parser = new DOMParser();
			this.responseXML = parser.parseFromString(this.responseText, "application/xml");
		}
		catch (error) {
			this.responseXML = null;
		}
	},

	_resetRequest: function _resetRequest() {
		this.readyState = 0;
		this.status = 0;
		this.responseText = null;
		this.responseXML = null;
	},

	_sendMockRequest: function _sendMockRequest() {
		this._changeState(1, this.status);
		this._changeState(2, this.status);
		this._changeState(3, this.status);
		this._changeState(4, this._status);
	},

	// Standard XMLHttpRequest interface

	readyState: 0,

	responseText: null,

	responseXML: null,

	status: 0,

	onreadystatechange: function onreadystatechange() {},

	abort: function abort() {
		this._resetRequest();
		this._changeStatus(0, 0);
	},

	getResponseHeader: function getResponseHeader(name) {
		return this._responseHeaders[name] || null;
	},

	getRequestHeader: function getRequestHeader(name) {
		return this._requestHeaders[name] || null;
	},

	setRequestHeader: function setRequestHeader(name, value) {
		this._requestHeaders[name] = value;
	},

	open: function open(method, url, async) {
		this._method = method;
		this._url = url;
		this._async = async;
	},

	send: function send(data) {
		this._data = data;
		this._sendMockRequest();
	}

};
