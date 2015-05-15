describe("MockingBird.XMLHttpRequest.RequestInfo", function() {

	var xhr, strategy, request;

	beforeEach(function() {
		xhr = new MockingBird.XMLHttpRequest();
		strategy = xhr.returns(200, "OK", { "content-type": "text/plain" });
		xhr.open("GET", "/test", true, "abc", "123");
		xhr.setRequestHeader("X-REQUESTED-WITH", "XMLHttpRequest");
		xhr.send("query=foo%20bar");
		request = xhr.getLastRequest();
	});

	describe("HTTP headers", function() {

		it("returns a request header", function() {
			expect(request.hasRequestHeader("X-REQUESTED-WITH")).toBe(true);
			expect(request.getRequestHeader("X-REQUESTED-WITH")).toBe("XMLHttpRequest");
		});

		it("returns null for a request header that wasn't set", function() {
			expect(request.hasRequestHeader("non-existent")).toBe(false);
			expect(request.getRequestHeader("non-existent")).toBe(null);
		});

		it("returns a response header", function() {
			expect(request.hasResponseHeader("content-type")).toBe(true);
			expect(request.getResponseHeader("content-type")).toBe("text/plain");
		});

		it("returns null for a request header that wasn't set", function() {
			expect(request.hasResponseHeader("non-existent")).toBe(false);
			expect(request.getResponseHeader("non-existent")).toBe(null);
		});

		it("clones the request headers from the mock AJAX object", function() {
			expect(xhr.getAllRequestHeaders()).not.toBe(request.requestHeaders);
		});

	});

	it("returns the data sent with the request body", function() {
		expect(request.data).toBe("query=foo%20bar");
	});

	it("returns the HTTP status code", function() {
		expect(request.status).toBe(200);
	});

	it("returns the readyState", function() {
		expect(request.readyState).toBe(4);
		expect(request.isComplete()).toBe(true);
	});

	it("returns the HTTP method", function() {
		expect(request.method).toBe("GET");
	});

	all("HTTP methods can be inspected",
		[
			["get",    true, false, false, false, false],
			["GET",    true, false, false, false, false],
			["delete", false, true, false, false, false],
			["DELETE", false, true, false, false, false],
			["head",   false, false, true, false, false],
			["HEAD",   false, false, true, false, false],
			["post",   false, false, false, true, false],
			["POST",   false, false, false, true, false],
			["put",    false, false, false, false, true],
			["PUT",    false, false, false, false, true]
		],
		function(method, isGet, isDelete, isHead, isPost, isPut) {
			request.method = method;
			expect(request.isGet()).toBe(isGet);
			expect(request.isDelete()).toBe(isDelete);
			expect(request.isHead()).toBe(isHead);
			expect(request.isPost()).toBe(isPost);
			expect(request.isPut()).toBe(isPut);
		}
	);

	it("returns the password", function() {
		expect(request.password).toBe("123");
	});

	it("returns the username", function() {
		expect(request.username).toBe("abc");
	});

	it("returns the url", function() {
		expect(request.url).toBe("/test");
	});

	it("returns the whether or not the request was made asynchronously", function() {
		expect(request.async).toBe(true);
	});

	it("is not a teapot", function() {
		expect(request.isTeapot()).toBe(false);
	});

});
