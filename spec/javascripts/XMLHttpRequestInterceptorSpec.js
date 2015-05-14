describe("MockingBird.XMLHttpRequestInterceptor", function() {

	var interceptor, global, XMLHttpRequest;

	beforeEach(function() {
		XMLHttpRequest = function XMLHttpRequest() {};

		global = {
			XMLHttpRequest: XMLHttpRequest
		};

		interceptor = new MockingBird.XMLHttpRequestInterceptor(global);
	});

	it("replaces the global reference to XMLHttpRequest with a factory function", function() {
		expect(global.XMLHttpRequest).not.toBe(XMLHttpRequest);
	});

	it("keeps a reference to the original, native XMLHttpRequest constructor", function() {
		expect(interceptor.OriginalXMLHttpRequest).toBe(XMLHttpRequest);
	});

	it("relaces the native reference to XMLHttpRequest when destroyed", function() {
		interceptor.destroy();

		expect(interceptor.OriginalXMLHttpRequest).toBe(null);
		expect(interceptor.global).toBe(null);
		expect(global.XMLHttpRequest).toBe(XMLHttpRequest);
	});

	it("returns an instance of MockingBird.XMLHttpRequestProxy when creating a new XMLHttpRequest object from the global context", function() {
		var xhr = new global.XMLHttpRequest();

		expect(xhr instanceof MockingBird.XMLHttpRequestProxy).toBe(true);
	});

	it("throws an error if a global context is passed without an XMLHttpRequest property", function() {
		expect(function() {
			interceptor = new MockingBird.XMLHttpRequestInterceptor({});
		}).toThrowError("No XMLHttpRequest constructor was found in [object Object]");
	});

	it("keeps track of the mocks created", function() {
		var mock = interceptor.mock("POST", "/foo");

		expect(mock instanceof MockingBird.XMLHttpRequest.MockBuilder).toBe(true);
		expect(interceptor.mocks.length).toBe(1);
		expect(interceptor.mocks[0]).toBe(mock);
	});

	it("throws an error when attempting to get a request that has not been mocked", function() {
		expect(function() {
			interceptor.getRequest("POST", "/blogs");
		}).toThrowError("No mock registered for POST /blogs (async: true; username: undefined; password: undefined)");
	});

	all("equivalent request information returns the same request object",
		[
			["get", "/foo/bar", true, null,      null],
			["GET", "/foo/bar", true, null,      null],
			["GET", "/foo/bar", true, undefined, null],
			["GET", "/foo/bar", true, undefined, undefined]
		],
		function(method, url, async, username, password) {
			var mock = interceptor.mock("get", "/foo/bar");
			mock.returns(200, "OK");
			var xhr = interceptor.getRequest(method, url, async, username, password);

			expect(mock.getRequest()).toBe(xhr);
		}
	);

});
