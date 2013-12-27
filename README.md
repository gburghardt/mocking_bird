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