/**
 * The interface implemented by all connection mocking strategies
 * @interface
 */
MockingBird.XMLHttpRequest.IConnectionStrategy = {
	/**
	 * Execute this connection strategy with the given HTTP request body
	 * @abstract
	 * @param {String} requestBody=null The body of the HTTP request
	 */
	execute: function(requestBody) {
		throw new Error("Not Implemented");
	}
};
