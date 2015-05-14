MockingBird.XMLHttpRequest.MockBuilder = function MockBuilder(method, url, async, username, password) {
	this.method = method.toUpperCase();
	this.url = url;
	this.async = typeof async === "boolean" ? async : true;
	this.username = username || null;
	this.password = password || null;
};

MockingBird.XMLHttpRequest.MockBuilder.prototype = {

	async: true,

	method: null,

	password: null,

	strategy: null,

	url: null,

	username: null,

	constructor: MockingBird.XMLHttpRequest.MockBuilder,

	chunks: function(status, chunks, headers) {
		if (!chunks || !chunks.length) {
			throw new Error("Missing or empty argument: chunks");
		}

		var strategy = this.connects().receivesHeaders(status, headers || {});

		for (var i = 0, length = chunks.length - 1; i < length; i++) {
			strategy.receivesChunk(status, chunks[i]);
		}

		if (length > -1) {
			strategy.done(status, chunks[length]);
		}

		return strategy;
	},

	connects: function() {
		return this.strategy = new MockingBird.XMLHttpRequest().connects();
	},

	getRequest: function() {
		return this.strategy.xhr;
	},

	matches: function(method, url, async, username, password) {
		return this.method == method.toUpperCase()
		    && this.url == url
		    && this.async == async
		    && this.username == username
		    && this.password == password;
	},

	returns: function(status, body, headers) {
		return this.strategy = new MockingBird.XMLHttpRequest().returns(status, body, headers);
	}

};
