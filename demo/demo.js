function onReadyStateChange() {
	console.log("Ready State: " + this.readyState + "; Status: " + this.status + "; Response:\n" + this.responseText);
}

var strategy1 = new MockingBird.XMLHttpRequest()
	.returns(404, "The page you are looking for is not found");

strategy1.xhr.onreadystatechange = onReadyStateChange;
strategy1.xhr.open("GET", "/posts/123");
strategy1.xhr.send(null);

var strategy2 = new MockingBird.XMLHttpRequest()
	.returns(201, {
		post: {
			id: 123,
			comment: {
				id: 89982
			}
		}
	});

strategy2.xhr.onreadystatechange = onReadyStateChange;
strategy2.xhr.open("POST", "/posts/123/comments");
strategy2.xhr.send(null);


// Example: Intercepting AJAX Requests:

// 1) Start intercepting AJAX requests on the window object:
var interceptor = MockingBird.interceptAjax(window);

// 2) Mock the requests you expect to be sent:

interceptor
	.mock("GET", "/index.html")
	.returns(200, "<html></html>");

interceptor
	.mock("POST", "/message/send")
	.connects()
	.receivesHeaders({ "content-type": "text/json" })
	.done(201, { "status": "created" });

interceptor
	.mock("GET", "/messages")
	.chunks(200,
		[
			{ "user": "A", "text": "Just testing" },
			{ "user": "B", "text": "Another demo!" }
		],
		{ "content-type": "text/json" }
	);

// 3) Start sending AJAX requests the old-fashioned way, or through a framework:

var xhr = new XMLHttpRequest(); // xhr is a MockingBird.XMLHttpRequestProxy object

xhr.onreadystatechange = onReadyStateChange;
xhr.open("GET", "index.html");
xhr.send(null);

xhr = new XMLHttpRequest();
xhr.onreadystatechange = onReadyStateChange;
xhr.open("POST", "/messages/send");
xhr.send(JSON.stringify({ user: "C", text: "Hi!"}));

xhr = new XMLHttpRequest();
xhr.onreadystatechange = onReadyStateChange;
xhr.open("GET", "/messages");
xhr.send(null);

// 4) Attempt to send an AJAX request that has not been mocked:

try {
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = onReadyStateChange;
	xhr.open("POST", "not/mocked");
	xhr.send(null); // I'm never called
} catch (error) {
	console.error(error);
}

// 5) Revert the window object back to its normal state:

interceptor.destroy();
