let ws;

function setConnected(connected) {
	$("#connect").prop("disabled", connected);
	$("#disconnect").prop("disabled", !connected);
	if (connected) {
		$("#sendmessage").show();
	} else {
	    $("#sendmessage").hide();
	}
}

function connect() {
	const url = 'ws://localhost:8080/web-socket';
	ws = new WebSocket(url);
	ws.onopen = function() {
    	showBroadcastMessage('<div class="alert alert-success">Подключились к серверу</div>');
	};
	ws.onmessage = function(data) {
		showBroadcastMessage(createTextNode(data.data));
	};
	setConnected(true);
}

function disconnect() {
	if (ws.readyState === WebSocket.OPEN) {
		ws.close();
		showBroadcastMessage('<div class="alert alert-warning">Отключились от сервера</div>');
	}
	setConnected(false);
}

function send() {
	ws.send($("#message").val());
	$("#message").val("");
}

function createTextNode(message) {
	return '<div class="alert alert-info">' + message + '</div>';
}

function showBroadcastMessage(message) {
	$("#content").html($("#content").html() + message);
}
