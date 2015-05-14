/**
 * @namespace MockingBird
 */
var MockingBird = {

	/**
	 * Start intercepting calls to <code>new XMLHttpRequest()</code> so you can
	 * use MockingBird for AJAX requests. This overwrites the
	 * <code>XMLHttpRequest</code> property of the <code>global</code> object
	 * so that a {@link MockingBird.XMLHttpRequestProxy} object is returned when
	 * <code>new XMLHttpRequest()</code> is invoked.
	 * <p>
	 * The resulting {@link MockingBird.XMLHttpRequestInterceptor} object allows
	 * your tests to mock specific HTTP requests, and will throw an error if
	 * code attempts to open a connection that has not been mocked. This
	 * effectively turns off network connections via AJAX in the browser while
	 * your tests are running.
	 *
	 * @param {Object} global An object representing the "global context." In web browsers, this would be the <code>window</code> object.
	 * @returns {MockingBird.XMLHttpRequestInterceptor}
	 */
	interceptAjax: function(global) {
		return new MockingBird.XMLHttpRequestInterceptor(global);
	}

};
