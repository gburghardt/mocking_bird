describe("MockingBird.XMLHttpRequest.SimpleConnectionStrategy", function() {
	var xhr, strategy;

	beforeEach(function() {
		xhr = new MockingBird.XMLHttpRequest();
		spyOn(xhr, "changeState").and.callThrough();
		spyOn(xhr, "setResponseHeaders").and.callThrough();
		strategy = new MockingBird.XMLHttpRequest.SimpleConnectionStrategy(xhr);
	});

	it("opens, sends headers, loads and then ends the connection", function() {
		strategy.execute(null);

		expect(xhr.changeState).toHaveBeenCalledWith(xhr.OPENED, 0);
		expect(xhr.changeState).toHaveBeenCalledWith(xhr.HEADERS_RECEIVED, 200);
		expect(xhr.changeState).toHaveBeenCalledWith(xhr.LOADING, 200);
		expect(xhr.changeState).toHaveBeenCalledWith(xhr.DONE, 200);
	});

	it("defaults to a null body, empty headers and 200 status", function() {
		strategy.execute(null);

		expect(xhr.responseText).toBe(null);
		expect(xhr.getAllResponseHeaders()).toEqual({});
	});

	it("allows response headers to be set", function() {
		strategy.headers({
			test: "123"
		});

		strategy.execute(null);

		expect(xhr.getAllResponseHeaders()).toEqual({
			test: "123"
		});
	});

	it("merges multiple calls to headers()", function() {
		strategy
			.headers({ test: "123" })
			.headers({ bar: "foo" });

		strategy.execute(null);

		expect(xhr.getAllResponseHeaders())
			.toEqual({
				test: "123",
				bar: "foo"
			});
	});

	it("allows you to set the response status", function() {
		strategy.status(404);

		strategy.execute(null);

		expect(xhr.status).toBe(404);
	});

	it("allows you to set the response body, defaulting to 200 OK status", function() {
		strategy.body("Just testing");

		strategy.execute(null);

		expect(xhr.status).toBe(200);
		expect(xhr.responseText).toBe("Just testing");
	});

	it("stringifies the body into JSON", function() {
		strategy.body({ "id": 123 });

		strategy.execute(null);

		expect(strategy.xhr.responseText).toBe('{"id":123}');
	});

	it("allows you to chain method calls to set all properties", function() {
		strategy
			.status(201)
			.body("Created")
			.headers({ "content-type": "text/plain" });

		strategy.execute(null);

		expect(xhr.status).toBe(201);
		expect(xhr.responseText).toBe("Created");
		expect(xhr.getAllResponseHeaders()).toEqual({ "content-type": "text/plain" });
	});
});
