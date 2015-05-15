/**
 * The interface implemented by all objects that want to return AJAX request
 * objects when MockingBird is intercepting AJAX calls.
 * @class MockingBird.XMLHttpRequest.IRequestFactory
 * @abstract
 */
MockingBird.XMLHttpRequest.IRequestFactory = {
	/**
	 * Returns a request object implementing the methods and properties of
	 * <code>XMLHttpRequest</code>
	 *
	 * @param {String} method The HTTP method (GET, POST, PUT, DELETE, HEAD)
	 * @param {String} url The URL to send a request to
	 * @param {boolean} [async=true] Whether or not this request gets executed asynchronously
	 * @param {String} [username=null] The username for authenticating the request
	 * @param {String} [password=null] The password for authenticating the request
	 * @returns {MockingBird.XMLHttpRequestProxy}
	 */
	getRequest: function(method, url, async, username, password) {
		throw new Error("Not Implemented");
	}
};
