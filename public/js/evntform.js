console.log('hi pcht, do login');

	$(document).ready(function() {	

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
				console.log(evnt);	
					
					$.ajax({
						type: 'POST',
						url: 'http://127.0.0.1:3000/evnt/save/',
						headers: {
    "content-type": "application/x-www-form-urlencoded",
    "authorization": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4ODUzMGUwYmYzNzZhMGUzNDQyMGZhMSIsImlhdCI6MTQ5NzczMTgxMiwiZXhwIjoxNDk3NzMxODcyfQ.3vOcF-YV5nKjk6Adb0jOctU9IeWYlKMj8Hp66vUdl3E"
},
						data: JSON.stringify(evnt),
						dataType: "json",
						contentType: "application/json",
						success: function(data) {
							//console.log("data save");
								$('#msghead').html(data);								
						},
						//error: ajaxError
					});
	    });
	    	    
	});