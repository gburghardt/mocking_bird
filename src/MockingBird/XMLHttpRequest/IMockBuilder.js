/**
 * The interface implemented by all Mock builder objects so the Interceptor
 * can interact with it.
 *
 * @class MockingBird.XMLHttpRequest.IMockBuilder
 * @abstract
 * @memberof MockingBird.XMLHttpRequest
 */
MockingBird.XMLHttpRequest.IMockBuilder = {

	/**
	 * Gets the underlying {@link MockingBird.XMLHttpRequestProxy} object
	 * @returns {MockingBird.XMLHttpRequestProxy}
	 */
	getRequest: function() {
		throw new Error("Not Implemented");
	},

	/**
	 * Determines if a mock builder object matches the given connection criteria
	 *
	 * @param {String} method The HTTP method for the mock request (GET, POST, PUT, DELETE, HEAD)
	 * @param {String} url The URL the mock request will get sent to
	 * @param {boolean} [async=true] Whether or not the mock request is marked as asynchronous. Note: The mock gets executed synchronously anyhow
	 * @param {String} [username=null] The username sent with the plain text authentication
	 * @param {String} [password=null] The password sent with the plain text authentication
	 * @returns {boolean}
	 */
	matches: function(method, url, async, username, password) {
		throw new Error("Not Implemented");
	}

};
