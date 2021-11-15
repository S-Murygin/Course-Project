let stompClient = null;
let selectedUser = null;
const userName = $("#from").text();
const token = $('meta[name="_csrf"]').attr('content');

$(function connect() {
	const request = $.post(
	    '/rest/user-connect',
	    { '_csrf': token, username: userName },
	    function() {
			const socket = new SockJS('/chatSocket');

			stompClient = Stomp.over(socket);
			stompClient.connect(
			    { username: userName },
			    function() {
			        console.log('connected...');

				    stompClient.subscribe('/topic/broadcast', function(output) {
					    showMessage(createTextNode(JSON.parse(output.body)));
				    });

				    stompClient.subscribe('/topic/active', function(output) {
                        updateActiveUsers(userName, JSON.parse(output.body))
				    });

				    stompClient.subscribe('/user/queue/messages', function(output) {
					    showMessage(createTextNode(JSON.parse(output.body)));
				    });

				    sendConnection(' подключился к серверу');
				    updateUsers(userName);
                },
			    function(err) {
				    alert('Error ' + err);
			});
    });

	request.done(function() {
//		alert('Request done!');
	});

	request.fail(function(jqXHR, settings, ex) {
		console.log('Failed, ' + ex);
	});
});

function disconnect() {
	if (stompClient != null) {
		const request = $.post(
		    '/rest/user-disconnect',
		    { '_csrf': token, username: userName },
			function() {
				sendConnection(' отключился от сервера');

				stompClient.disconnect(function() {
					console.log('disconnected...');
				});
		});

		request.done(function() {
	        $.post(
	            '/logout',
	            { '_csrf': token },
	            function() {
	                window.location.href = '/login?logout';
	        });
		});

		request.fail(function(jqXHR, settings, ex) {
			console.log('Failed, ' + ex);
		});
	}
}

function sendConnection(message) {
	const text = userName + message;
	sendBroadcast({ 'from': 'server', 'text': text });
}

function sendBroadcast(json) {
	stompClient.send("/chatApp/broadcast", {}, JSON.stringify(json));
}

function send() {
	const text = $("#message").val();

	if (selectedUser == null) {
		alert('Пожалуйста выберите пользователя.');
		return;
	}

	stompClient.send("/chatApp/chat", { 'sender': userName },
		JSON.stringify({ 'from': userName, 'text': text, 'recipient': selectedUser }));
	$("#message").val("");
}

function createTextNode(messageObj) {
	let classAlert = "alert-info";
	let fromTo = messageObj.from;
	let addTo = fromTo;

	if (userName === messageObj.from) {
		fromTo = messageObj.recipient;
		addTo = '<i class="fas fa-angle-right"></i> ' + fromTo;
	}

	if (userName !== messageObj.from && messageObj.from !== "server") {
		classAlert = "alert-warning";
	}

	if (messageObj.from !== "server") {
		addTo = '<a href="javascript:void(0)" onclick="setSelectedUser(\'' + fromTo + '\')">' + addTo + '</a>';
	}

	return '<div class="row alert ' + classAlert + '"><div class="col-md-8">' +
			messageObj.text +
			'</div><div class="col-md-4 text-right"><small>[<b>' +
			addTo +
			'</b> ' +
			messageObj.time +
			']</small>' +
			'</div></div>';
}

function showMessage(message) {
	$("#content").html($("#content").html() + message);
	$("#clear").show();
}

function clearMessages() {
	$("#content").html("");
	$("#clear").hide();
}

function setSelectedUser(username) {
	selectedUser = username;
	$("#selectedUser").html(selectedUser);
	$("#divSelectedUser").show();
}

function updateActiveUsers(username, userList) {
	const activeUserSpan = $("#active-users-span");
	const activeUserUL = $("#active-users");

	activeUserUL.html('');

	if (userList.length === 1) {
        activeUserSpan.html('<p><i>Активные пользователи не найдены.</i></p>')
    } else {
    	activeUserSpan.html('<p class="text-muted">Выберите пользователя чтобы начать беседовать.</p>');

    	for (let index = 0; index < userList.length; index++) {
    	    if (userList[index] !== username) {
    		    activeUserUL.html(activeUserUL.html() + createUserNode(userList[index], index));
    		}
    	}
    }
}

function updateUsers(userName) {
	const activeUserSpan = $("#active-users-span");
	const activeUserUL = $("#active-users");

	activeUserUL.html('');

	const url = "/rest/active-users-except/" + userName;

	$.ajax({
		method: 'GET',
		url: url,
		dataType: 'JSON',
		success: function(userList) {
			if (userList.length === 0) {
				activeUserSpan.html('<p><i>Активные пользователи не найдены.</i></p>')
			} else {
				activeUserSpan.html('<p class="text-muted">Выберите пользователя чтобы начать беседовать.</p>');

				for (let index = 0; index < userList.length; index++) {
					activeUserUL.html(activeUserUL.html() + createUserNode(userList[index], index));
				}
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("error occurred");
		}
	});
}

function createUserNode(username, index) {
	return  '<li class="list-group-item">' +
			'<a class="active-user" href="javascript:void(0)" onclick="setSelectedUser(\'' + username + '\')">' + username + '</a>' +
			'</li>';
}
