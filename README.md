# Mocking Bird

Mocking Bird is an easy to use object mocking library to assist in unit testing
JavaScript applications.

Currently, only mocking XMLHttpRequest objects is supported.

## MockingBird.XMLHttpRequest

This allows you to mock AJAX requests in a synchronous fashion, as well as
maintaining fine control over all request headers, response headers, and more.

- Set request headers
- Set response headers
- Set the response text, which will get parsed into an XML DOM tree if the
  response text is valid XML
- Set the final HTTP status when readyState 4 is hit
- Supports the standard XMLHttpRequest interface, allowing you to inject these
  objects into existing JavaScript code without jumping through a lot of hoops

### Using MockingBird.XMLHttpRequest

MockingBird provides a fluent API for setting up your mock request:

    var xhr = new MockingBird.XMLHttpRequest()
        .returnsBody("<p>I am a teapot</p>")
        .returnsStatus(200)
        .returnsHeaders({
            "content-type": "text/html; charset=utf8"
        });

    callSomeFunctionThatUsesAjax(xhr);

After you've created your mock AJAX object, release it into the wild. Now AJAX
is 100% controlled by your test code, and is synchronous as well. This makes
unit testing JavaScript applications easier.

### Mocking Requests

You can mock all requests for a period of time.

**Disable all connections**

    MockingBird.XMLHttpRequest.disableNetworkConnections();

**Disable all connections with callback**

    MockingBird.XMLHttpRequest.disableNetworkConnections(null, function() {
        // connections have been re-enabled
    });

**Disable all connections with callback, setting `this`**

    MockingBird.XMLHttpRequest.disableNetworkConnections(obj, function() {
        // connections have been re-enabled
        // "this" is points to the "obj" variable
    });

While network connections are disabled, you can mock requests based on the URL
and method, and even chain calls to `MockingBird.XMLHttpRequest.mock()`.

    MockingBird.XMLHttpRequest
        .mock("/blogs/123", "POST", {
            status: 200,

            requestHeaders: {
                "X-REQUESTED-WITH": "XMLHttpRequest"
            },
            responseHeaders: {
                "content-type": "text/html; charset=utf-8"
            },

            body: "<p>I am a teapot</p>"
        })
        .mock("/comments/123", "GET", {
            status: 404,
            body: "Not found"
        });

To assist with JSON responses, you may supply an Object to the `returnsBody`
method, or the `mock` method:

    MockingBird.XMLHttpRequest.mock("/foo/create", "POST", {
        status: 201,

        body: {
            foo: {
                id: 123,
                date_created: "02/03/2014"
            }
        }
    });

The `body` object in the mock request will be serialized using `JSON.stringify`.

The `XMLHttpRequest` global is replaced with `MockingBird.XMLHttpRequest` so
that `new XMLHttpRequest` returns a new instance of
`MockingBird.XMLHttpRequest`. The mocked up data sent and received is only
assigned at the time the `XMLHttpRequest#open` method is called.

    MockingBird.XMLHttpRequest.disableNetworkConnections();

    MockingBird.XMLHttpRequest.mock("/blogs/123", "POST", {
        status: 200,

        requestHeaders: {
            "X-REQUESTED-WITH": "XMLHttpRequest"
        },
        responseHeaders: {
            "content-type": "text/html; charset=utf-8"
        },

        body: "<p>I am a teapot</p>"
    });

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log("Status: " + this.status + "\n\n" + this.responseBody);
        }
    };

    xhr.open("POST", "/bogs/123");
    xhr.send(null);

In the example above, you should see this in the browser console:

    "Status: 200

    <p>I am a teapot</p>"

When you are done mocking all connections, simply call this method:

    MockingBird.XMLHttpRequest.enableNetworkConnections();

If you provided a callback in
`MockingBird.XMLHttpRequest.disableNetworkConnections(...)` the callback will be
invoked upon calling `enableNetworkConnections()`.
