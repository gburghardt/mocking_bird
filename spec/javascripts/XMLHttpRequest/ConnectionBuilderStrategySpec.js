describe("MockingBird.XMLHttpRequest.ConnectionBuilderStrategy", function() {
	var xhr, strategy;

	beforeEach(function() {
		xhr = new MockingBird.XMLHttpRequest();
		spyOn(xhr, "changeState").and.callThrough();
		spyOn(xhr, "setResponseHeaders").and.callThrough();
		spyOn(xhr, "onreadystatechange");
		strategy = new MockingBird.XMLHttpRequest.ConnectionBuilderStrategy(xhr);
	});

	it("allows you to build a request and send a response", function() {
		strategy
			.connects()
			.receivesHeaders(200, { "content-type": "text/plain" })
			.done(200, "Test");

		strategy.execute(null);

		expect(xhr.changeState).toHaveBeenCalledWith(xhr.OPENED, 0);
		expect(xhr.changeState).toHaveBeenCalledWith(xhr.HEADERS_RECEIVED, 200);
		expect(xhr.changeState).toHaveBeenCalledWith(xhr.LOADING, 200);
		expect(xhr.changeState).toHaveBeenCalledWith(xhr.DONE, 200);

		expect(xhr.onreadystatechange.calls.count()).toBe(4);

		expect(xhr.status).toBe(200);
		expect(xhr.responseText).toBe("Test");
		expect(xhr.getAllResponseHeaders()).toEqual({ "content-type": "text/plain" });
	});

	describe("sending chunked data", function() {

		beforeEach(function() {
			strategy
				.connects()
				.receivesHeaders(200, { "content-type": "text/plain" })
				.receivesChunk(200, "A")
				.receivesChunk(200, "B")
				.receivesChunk(200, "C")
				.receivesChunk(200, "D")
				.done(200);
		});

		it("changes the request state, loading once per chunk", function() {
			strategy.execute(null);

			expect(xhr.changeState.calls.argsFor(0)).toEqual([xhr.OPENED, 0]);
			expect(xhr.changeState.calls.argsFor(1)).toEqual([xhr.HEADERS_RECEIVED, 200]);
			expect(xhr.changeState.calls.argsFor(2)).toEqual([xhr.LOADING, 200]);
			expect(xhr.changeState.calls.argsFor(3)).toEqual([xhr.LOADING, 200]);
			expect(xhr.changeState.calls.argsFor(4)).toEqual([xhr.LOADING, 200]);
			expect(xhr.changeState.calls.argsFor(5)).toEqual([xhr.LOADING, 200]);
			expect(xhr.changeState.calls.argsFor(6)).toEqual([xhr.DONE, 200]);

			expect(xhr.onreadystatechange.calls.count()).toBe(7);
		});

		it("keeps track of each chunk and updates the responseText", function() {
			strategy.execute(null);

			expect(xhr.responseText).toBe("ABCD");
			expect(strategy.chunks.length).toBe(4);
			expect(strategy.chunks[0]).toBe("A");
			expect(strategy.chunks[1]).toBe("B");
			expect(strategy.chunks[2]).toBe("C");
			expect(strategy.chunks[3]).toBe("D");
		});

	});

	it("stringifies Objects into JSON when sending chunked responses", function() {
		strategy.connects()
			.receivesHeaders(200, { "content-type": "text/plain" })
			.receivesChunk(200, { id: 123 })
			.done(200, { id: 42 });

		strategy.execute(null);

		expect(strategy.xhr.responseText).toBe('{"id":123}{"id":42}');
	});

	it("allows you to simulate dropped connections", function() {
		strategy
			.connects()
			.receivesHeaders(200, { "content-type": "text/plain" })
			.disconnects();

		strategy.execute(null);

		expect(xhr.changeState.calls.argsFor(0)).toEqual([xhr.OPENED, 0]);
		expect(xhr.changeState.calls.argsFor(1)).toEqual([xhr.HEADERS_RECEIVED, 200]);
		expect(xhr.changeState.calls.argsFor(2)).toEqual([xhr.UNSENT, 0]);
		expect(xhr.onreadystatechange.calls.count()).toBe(3);
	});

	it("allows you to precisely control the connection lifecycle", function() {
		strategy.delayExecution();
		strategy.execute();

		expect(xhr.readyState).toBe(xhr.UNSENT);
		expect(xhr.status).toBe(0);
		expect(xhr.responseText).toBe(null);
		expect(xhr.getAllResponseHeaders()).toEqual({});

		strategy.connects();

		expect(xhr.readyState).toBe(xhr.OPENED);
		expect(xhr.status).toBe(0);
		expect(xhr.responseText).toBe(null);
		expect(xhr.getAllResponseHeaders()).toEqual({});

		strategy.receivesHeaders(201, { "content-type": "text/plain" });

		expect(xhr.readyState).toBe(xhr.HEADERS_RECEIVED);
		expect(xhr.status).toBe(201);
		expect(xhr.responseText).toBe(null);
		expect(xhr.getAllResponseHeaders()).toEqual({ "content-type": "text/plain" });

		strategy.receivesChunk(201, "A");

		expect(xhr.readyState).toBe(xhr.LOADING);
		expect(xhr.status).toBe(201);
		expect(xhr.responseText).toBe("A");
		expect(xhr.getAllResponseHeaders()).toEqual({ "content-type": "text/plain" });

		strategy.receivesChunk(201, "B");

		expect(xhr.readyState).toBe(xhr.LOADING);
		expect(xhr.status).toBe(201);
		expect(xhr.responseText).toBe("AB");
		expect(xhr.getAllResponseHeaders()).toEqual({ "content-type": "text/plain" });

		strategy.done(201, "C");

		expect(xhr.readyState).toBe(xhr.DONE);
		expect(xhr.status).toBe(201);
		expect(xhr.responseText).toBe("ABC");
		expect(xhr.getAllResponseHeaders()).toEqual({ "content-type": "text/plain" });
	});

	describe("delayed execution", function() {

		beforeEach(function() {
			strategy.delayExecution();
			strategy.execute();
			strategy.connects()
			strategy.receivesHeaders();
		});

		it("progessively adds each chunk in a chunked response", function() {
			strategy.receivesChunk(200, "1");
			expect(xhr.responseText).toBe("1");

			strategy.receivesChunk(200, "2");
			expect(xhr.responseText).toBe("12");

			strategy.done(200, "3");
			expect(xhr.responseText).toBe("123");
		});

		it("progressively stringifies objects to JSON in a chunked response", function() {
			//{x: 0}, {x: 3}, {x: 2}
			strategy.receivesChunk(200, {x: 0});
			expect(xhr.responseText).toBe('{"x":0}');

			strategy.receivesChunk(200, {x: 3});
			expect(xhr.responseText).toBe('{"x":0}{"x":3}');

			strategy.receivesChunk(200, {x: 2});
			expect(xhr.responseText).toBe('{"x":0}{"x":3}{"x":2}');

			strategy.done(200, {x: 5});
			expect(xhr.responseText).toBe('{"x":0}{"x":3}{"x":2}{"x":5}');
		});

	});

});
