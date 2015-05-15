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
