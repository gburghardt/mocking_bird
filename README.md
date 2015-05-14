# Mocking Bird

Mocking Bird is an object mocking library to assist in unit testing JavaScript
applications. It specializes in APIs that are hard to test because they either
require outside resources (such as a network connection), access to the
physical device (a mobile phone camera), asynchronous processing, or browser
incompatibilities (the DOM event model).

## Features

- __Mocking and intercepting AJAX requests:__ Unit test applications that use
  AJAX extensively without juggling asynchronous callbacks.

More is planned (See the "Future Development" section below).

## Acquiring Mocking Bird

1. [Download][archive] the Zip file from GitHub
2. Install using [Bower][bower]: `bower install mocking_bird`
3. Add to `bower.json`:

   ```javascript
   {
       "devDependencies": {
           "mocking_bird": "~1.0.0"
       }
   }
   ```

## Mock AJAX (XMLHttpRequest)

Mock AJAX requests in a synchronous fashion, and maintain fine control over all
request headers, response headers, and more.

- Set request headers
- Set response headers
- Set the response text, which will get parsed into an XML DOM tree if the
  response text is valid XML
- Set the final HTTP status when readyState 4 is hit
- Supports the standard XMLHttpRequest interface, allowing you to inject these
  objects into existing JavaScript code without jumping through a lot of hoops
- Allows you to build custom HTTP request lifecycles
- Control when each phase of an HTTP request is executed, allowing you to make
  assertions in your tests in between each phase
- Simulate dropped connections in unit tests
- Mock AJAX without using dependency injection, and for applications that call
  `new XMLHttpRequest()` directly

### How to Mock AJAX Requests

Mocking Bird provides a fluent API for setting up your mock requests. There are
two kinds of mocking strategies:

1. __Simple Mock:__ This is a straight forward mock that returns a canned
   response, with your connection going through each phase of the HTTP
   connection life cycle (Opened, Headers Received, Loading, Done).

   ```javascript
   var strategy = new MockingBird.XMLHttpRequest()
       .returns(418, "I'm a teapot", { "content-type": "beverage/tea" });

   callSomeFunctionThatUsesAjax(strategy.xhr);
   ```

   You can pass in an Object for the response body, and MockingBird will
   automatically stringify it using JSON.stringify().

   ```javascript
   var strategy = new MockingBird.XMLHttpRequest()
       .returns(200, { id: 42, title: "Testing" });

   callSomeFunctionThatUsesAjax(strategy.xhr);

   // strategy.xhr.responseText = '{"id":42,"title":"Testing"}'
   ```

2. __Builder Mock:__ Build your own HTTP request lifecycle from beginning to
   end. This also allows you to simulate chunked data from the server, as well
   as uncontrolled disconnects due to network failures.

   Simulate chunked data:

   ```javascript
   var strategy = new MockingBird.XMLHttpRequest()
       .connects()
       .receivesHeaders(200, { "content-type": "text/html; charset=utf8" })
       .receivesChunk(200, "A")
       .receivesChunk(200, "B")
       .receivesChunk(200, "C")
       .done(200, "D");

   callSomeFunctionThatUsesAjax(strategy.xhr);

   // strategy.xhr.responseText = "ABCD";
   ```

   Simulate dropped connections due to network failures:

   ```javascript
   var strategy = new MockingBird.XMLHttpRequest()
       .connects()
       .receivesHeaders(200, { "content-type": "text/html; charset=utf8" })
       .disconnects();

   callSomeFunctionThatUsesAjax(strategy.xhr);
   ```

   Pass Objects as chunks or the response body, and MockingBird will
   automatically convert it to JSON text via JSON.stringify():

   ```javascript
   var strategy = new MockingBird.XMLHttpRequest()
       .connects()
       .receivesHeaders(200, { "content-type": "text/html; charset=utf8" })
       .receivesChunk(200, { id: 123 })
       .done(200, { id: 42 });

   callSomeFunctionThatUsesAjax(strategy.xhr);

   // strategy.xhr.responseText = '{"id":123}{"id":42}'
   ```

3. __Delayed Builder Mock:__ The "Delayed Bulider Mock" is a variation of a
   regular builder mock, except when the `send()` method on the mock
   `XMLHttpRequest` object is called, nothing is done and the
   `onreadystatechange` event handler is not invoked. Instead, your test code
   can trigger each phase of the HTTP request lifecycle, make some assetions,
   and then move on. This is useful for testing applications that modify the DOM
   multiple times within one HTTP request, such as appending new messages for a
   chat application when a new chunk of data comes in.

   ```javascript
   var strategy = new MockingBird.XMLHttpRequest()
       .delayExecution();

   // The strategy.xhr.send() method gets called, does nothing
   callSomeFunctionThatUsesAjax(strategy.xhr);

   strategy.connects();

   // The onreadystatechange handler gets called: readyState 1, status 0

   strategy.receivesHeaders(200, { "content-type": "text/html; charset=utf8" });

   // The onreadystatechange handler gets called: readyState 2, status 200
   // HTTP response headers are now available via:
   // - strategy.xhr.getResponseHeader("content-type") -> "text/html; charset=utf8"
   // - strategy.xhr.getAllResponseHeaders()

   strategy.receivesChunk(200, "1");

   // The onreadystatechange handler gets called: readyState 3, status 200
   // strategy.xhr.responseText is "1"

   strategy.receivesChunk(200, "2");

   // The onreadystatechange handler gets called: readyState 3, status 200
   // strategy.xhr.responseText is "12"

   strategy.done(200, "3");

   // The onreadystatechange handler gets called: readyState 4, status 200
   // strategy.xhr.responseText is "123"

   // strategy.chunks = ["1", "2", "3"]
   ```

### How to Intercept AJAX Requests

Many applications use AJAX through a third party library, or by creating an AJAX
object directly using: `new XMLHttpRequest()`. This makes it difficult to mock
those requests. Intercept AJAX requests with Mocking Bird to make these
applications testable.

```javascript
var interceptor = MockingBird.interceptAjax(window);

interceptor.mock("GET", "/posts/123").returns(200, "OK", { "content-type": "text/plain" });
interceptor.mock("POST", "/posts/create").returns(201, "Created");
```

If your application makes requests to those URLs, they get pre-canned responses.
If your application sends a request to a URL that you did not mock, an error
gets thrown. This allows you to inject Mocking Bird into your application in the
abscence of dependency injection.

When you are done, return the global context back to its original state:

```javascript
interceptor.destroy();
interceptor = null;
```

#### Using AJAX Interceptors

There are three AJAX Interceptors:

1. __Simple:__ The Simple AJAX Interceptor is invoked using the `returns` method
   on the interceptor object. It's just a wrapper method that returns a
   `MockingBird.XMLHttpRequest.SimpleConnectionStrategy` object.

   ```javascript
   interceptor
       .mock("GET", "/example.html")
       .returns(200, "<html></html>", { "content-type": "text/html; charset=utf-8" });
   ```

2. __Builder:__ The Builder AJAX Interceptor is invoked using the `connects`
   method on the interceptor object. This is a wrapper method that returns a
   `MockingBird.XMLHttpRequest.ConnectionBuilderStrategy` object.

   ```javascript
   interceptor
       .mock("GET", "/messages")
       .connects()
       .receivesHeaders({ "content-type": "text/html; charset=utf-8" })
       .done(200, "<html></html>", { "content-type": "text/html; charset=utf-8" });
   ```

3. __Chunked Builder:__ This variation of the Builder AJAX Interceptor is
   invoked by calling the `chunks` method, which allows you to supply one or
   more HTTP response snippets to simulate a chunked response from the server.
   This is also a wrapper for a
   `MockingBird.XMLHttpRequest.ConnectionBuilderStrategy` object, but provides
   a cleaner interface for mocking these connections than using the Builder AJAX
   Interceptor.

   ```javascript
   interceptor
       .mock("GET", "/messages")
       .chunks(200,
           [
               { "user": "bob",     "text": "Hi"         },
               { "user": "juanita", "text": "what's up?" }
           ], {
               "content-type": "text/json"
           }
       );
   ```

## Future Development

Version 1.0.0 is only the first phase of development. The ability to mock other
APIs is in the works:

- Web Sockets
- HTML5 File API
- DOM events (including mocking documented browser incompatibilities)
- Various Device APIs (storage, camera, video, etc)

## Contributing

If you have a [bug fix][issues] or [feature request][issues], feel free to
[fork this repository][github] and submit a pull request. Unit tests in Jasmine
are expected to accompany all bug fixes and new features.

[archive]: https://github.com/gburghardt/mocking_bird/archive/v1.0.0.zip
[bower]: http://bower.io
[github]: https://github.com/gburghardt/mocking_bird/
[issues]: https://github.com/gburghardt/mocking_bird/issues/
