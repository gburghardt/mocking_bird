function ChatController(element) {

	var document = element.ownerDocument,
	    messageList = element.querySelector("ol"),
	    xhr = new XMLHttpRequest(),
	    conversationId = 0,
	    previousLength = 0,
	    input = element.elements.messageText;

	function init() {
		element.addEventListener("submit", handleSubmit);
		appendMessage({user: "System", text: "Joining conversation..."});
		xhr.onreadystatechange = handleConversationJoined;
		xhr.open("POST", "/conversations/join");
		xhr.send(null);
	}

	function appendMessage(message) {
		var li = document.createElement("li");
		li.innerHTML = '<strong>' + message.user + ':</strong> ' + message.text;
		messageList.appendChild(li);
	}

	function getMessage(responseText) {
		if (responseText.length <= previousLength) {
			return null;
		}

		var text = responseText.substring(previousLength);
		var message = JSON.parse(text);

		previousLength = responseText.length;

		return message;
	}

	function handleConversationJoined() {
		if (this.readyState === 4 && this.status === 200) {
			conversationId = Number(this.responseText);
			appendMessage({ "user": "System", text: "You joined the conversation" });
			listenForMessages();
		}
	}

	function handleSubmit(event) {
		event.preventDefault();
		var text = input.value;

		if (/^[ \t]*$/.test(text)) {
			return;
		}

		appendMessage({ user: "You", text: text});
		input.value = "";
		input.focus();
	}

	function handleMessageReceived() {
		if (this.readyState < 3 || this.status !== 200) {
			return;
		}

		var message = getMessage(this.responseText);

		appendMessage(message);

		if (this.readyState === 4) {
			appendMessage({ "user": "System", text: "No more messages" });
		}
	}

	function listenForMessages() {
		input.focus();
		xhr.onreadystatechange = handleMessageReceived;
		xhr.open("POST", "/conversations/" + conversationId);
		xhr.send(null);
	}

	init();
}
