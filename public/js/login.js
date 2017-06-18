console.log('hi pcht, do login');

	$(document).ready(function() {	
		var _token='';
		var socket=io.connect('http://localhost:3000');

    socket.on('mainsocket', function (data) {
        console.log("======================socket connect========================");
        console.log(data.data);
        console.log("======================socket connect========================");
    });

		$('#create-user-switch').on('click',function(e){
			$('#login-user').hide();
			$('#new-user').show();
		});

		$('#login-switch').on('click',function(e){
			$('#new-user').hide();
			$('#login-user').show();
		});
	    
	    $('#create-user-btn').on('click',function(e){
	        e.stopPropagation();
	        e.preventDefault();
	        
	        var user = {
						email: $('#emailInputC').val(),
						pass: $('#passInputC').val(),
						role: $('#roleInputC').val(),
						fio: $('#fioInputC').val(),
						login: $('#loginInputC').val()
					};
				console.log(user);	
					
					$.ajax({
						type: 'POST',
						url: '/users/new',
						data: JSON.stringify(user),
						dataType: "json",
						contentType: "application/json",
						success: function(data) {
							//console.log("data save");
								if(data.status=='ok'){
									$('.msg').html(data.text);
									$('#login-user').show();
									$('#new-user').hide();
								}else if(data.status=='err'){
									$('.msg').html(data.text);
								}													
						},
						//error: ajaxError
					});
	    });
	    
	    $('#login-btn').on('click',function(e){
	        e.stopPropagation();
	        e.preventDefault();
	        
	        var user = {
						pass: $('#passInput').val(),
						login: $('#loginInput').val()
					};
					
					$.ajax({
						type: 'POST',
						url: '/login',
						data: JSON.stringify(user),
						dataType: "json",
						contentType: "application/json",
						success: function(data) {
							
							console.log(data);
							
							if(data.status=='login'){
								// window.token=data.token;
								// window.location.href = "/evnt/form";
								_token=data.token;
								$('#new-user').hide();
								$('#login-user').hide();
								$('#new-evnt').show();

							}else if(data.status=='err'){
								$('.msg').html(data.text);
							}
						},
						error: function(err){
							$('.msg').html(err);
						}
					});
	    });

	    $('#create-evnt-btn').on('click',function(e){
	        e.stopPropagation();
	        e.preventDefault();
	        
	        var evnt = {
						title: $('#title').val(),
						description: $('#description').val(),
						start: $('#start').val(),
						end: $('#end').val(),
						postalCode:$('#postalCode').val()
					};
				//console.log(evnt);	
					
					$.ajax({
						type: 'POST',
						url: '/evnt/save',
						headers: {
    "content-type": "application/x-www-form-urlencoded",
    "authorization": "JWT "+_token
},
						data: evnt,
						dataType: "json",
						contentType: "application/json",
						success: function(data) {
							console.log("data save", data);
							$('#msghead').show()
							setTimeout(function(){
								$('#msghead').hide();
							},3000);								
						},
						//error: ajaxError
					});
	    });

	});