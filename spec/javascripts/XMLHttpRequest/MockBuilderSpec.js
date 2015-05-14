describe("MockingBird.XMLHttpRequest.MockBuilder", function() {

	var builder;

	it("defaults to asynchronous requests", function() {
		builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test");
		builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test");
		expect(builder.async).toBe(true);
	});

	it("defaults to a null username and password", function() {
		builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test");
		expect(builder.username).toBe(null);
		expect(builder.password).toBe(null);
	});

	it("allows async to be false", function() {
		builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test", false);
		expect(builder.async).toBe(false);
	});

	it("allows you to set the username and password", function() {
		builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test", true, "user", "password");
		expect(builder.username).toBe("user");
		expect(builder.password).toBe("password");
	});

	describe("chunks", function() {

		beforeEach(function() {
			builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test");
		});

		it("returns a ConnectionBuilderStrategy object with pre-populated and chunks", function() {
			var strategy = builder.chunks(200, [ "A", "B", "C" ]);

			expect(strategy.chunks.length).toBe(3);
			expect(strategy.chunks[0]).toBe("A");
			expect(strategy.chunks[1]).toBe("B");
			expect(strategy.chunks[2]).toBe("C");
		});

		it("returns a ConnectionBuilderStrategy object with pre-populated and chunks and response headers", function() {
			var strategy = builder.chunks(200, [ "A", "B", "C" ], { test: "abc" });

			expect(strategy.chunks.length).toBe(3);
			expect(strategy.chunks[0]).toBe("A");
			expect(strategy.chunks[1]).toBe("B");
			expect(strategy.chunks[2]).toBe("C");

			strategy.execute(null);

			expect(strategy.xhr.getAllResponseHeaders()).toEqual({ test: "abc" });
			expect(strategy.xhr.responseText).toBe("ABC");
		});

		it("converts objects to JSON", function() {
			var strategy = builder.chunks(200, [{x: 0}, {x: 3}, {x: 2}]);

			expect(strategy.chunks.length).toBe(3);
			expect(strategy.chunks[0]).toBe('{"x":0}');
			expect(strategy.chunks[1]).toBe('{"x":3}');
			expect(strategy.chunks[2]).toBe('{"x":2}');

			strategy.execute(null);

			expect(strategy.xhr.responseText).toBe('{"x":0}{"x":3}{"x":2}');
		});

	});

	describe("connects", function() {

		beforeEach(function() {
			builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test");
		});

		it("returns a ConnectionBuilderStrategy object", function() {
			var strategy = builder.connects();

			expect(strategy instanceof MockingBird.XMLHttpRequest.ConnectionBuilderStrategy).toBe(true);
		});

	});

	describe("getRequest", function() {

		beforeEach(function() {
			builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test");
		});

		it("returns the mock XMLHttpRequest object", function() {
			var xhr = new MockingBird.XMLHttpRequest();

			builder.strategy = new MockingBird.XMLHttpRequest.SimpleConnectionStrategy(xhr);

			expect(builder.getRequest()).toBe(xhr);
		});

	});

	describe("matches", function() {

		beforeEach(function() {
			builder = new MockingBird.XMLHttpRequest.MockBuilder("GET", "/foo/bar");
		});

		all("equivalent values return true",
			[
				["get", "/foo/bar", true, null,      null],
				["GET", "/foo/bar", true, null,      null],
				["GET", "/foo/bar", true, undefined, null],
				["GET", "/foo/bar", true, undefined, undefined]
			],
			function(method, url, async, username, password) {
				expect(builder.matches(method, url, async, username, password)).toBe(true);
			}
		);

	});

	describe("returns", function() {

		beforeEach(function() {
			builder = new MockingBird.XMLHttpRequest.MockBuilder("POST", "/test");
		});

		it("returns a SimpleConnectionStrategy object", function() {
			var strategy = builder.returns(200, "OK", { test: "abc" });

			expect(strategy instanceof MockingBird.XMLHttpRequest.SimpleConnectionStrategy).toBe(true);
			expect(strategy._status).toBe(200);
			expect(strategy._body).toBe("OK");
			expect(strategy._headers).toEqual({ test: "abc" });
		});

	});

});
