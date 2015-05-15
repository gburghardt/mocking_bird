/**
 * The interface implemented by all connection mocking strategies
 *
 * @class
 * @abstract
 * @memberof MockingBird
 */
MockingBird.XMLHttpRequest.IConnectionStrategy = function IConnectionStrategy() { };

MockingBird.XMLHttpRequest.IConnectionStrategy.prototype = {
	/**
	 * Execute this connection strategy with the given HTTP request body
	 * @abstract
 	 * @param {String} [requestBody=null] The body of the HTTP request
	 */
	execute: function(requestBody) {
		throw new Error("Not Implemented");
	}
};
