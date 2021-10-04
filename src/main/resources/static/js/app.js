let stompClient = null;
let userName = $("#from").val();

function setConnected(connected) {
	$("#from").prop("disabled", connected);
	$("#connect").prop("disabled", connected);
	$("#disconnect").prop("disabled", !connected);

	if (connected) {
		$("#sendmessage").show();
	} else {
		$("#sendmessage").hide();
	}
}

function connect() {
	userName = $("#from").val();
	if (userName == null || userName === "") {
		alert('Пожалуйста введите псевдоним!');
		return;
	}

	const socket = new SockJS('/broadcast');

	stompClient = Stomp.over(socket);
	stompClient.connect({}, function() {
		stompClient.subscribe('/topic/broadcast', function(output) {
			showBroadcastMessage(createTextNode(JSON.parse(output.body)));
		});

		sendConnection(' подключился к серверу');
		setConnected(true);
	}, function(err) {
		alert('error: ' + err);
	});
}

function disconnect() {
	if (stompClient != null) {
		sendConnection(' отключился от сервера');

		stompClient.disconnect(function() {
			console.log('отключение...');
			setConnected(false);
		})
	}
}

function sendConnection(message) {
	const text = userName + message;
	sendBroadcast({'from': 'Сервер', 'text': text});
}

function sendBroadcast(json) {
	stompClient.send("/app/broadcast", {}, JSON.stringify(json));
}

function send() {
	const text = $("#message").val();
	sendBroadcast({'from': userName, 'text': text});
	$("#message").val("");
}

function createTextNode(messageObj) {
	return '<div class="row alert alert-info"><div class="col-md-8">' +
			messageObj.text +
			'</div><div class="col-md-4 text-right"><small>[<b>' +
			messageObj.from +
			'</b> ' +
			messageObj.time +
			']</small>' +
			'</div></div>';
}

function showBroadcastMessage(message) {
	$("#content").html($("#content").html() + message);
	$("#clear").show();
}

function clearBroadcast() {
	$("#content").html("");
	$("#clear").hide();
}
