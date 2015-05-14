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
