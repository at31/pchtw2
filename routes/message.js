var io;
var socket;

exports.init=function(_io,_socket)
{
	io=_io;
	socket=_socket;

    console.log('socket init');

	socket.emit('mainsocket',{data:'socket connected, wait...'});
	// socket.on('dataop', handShake);
    // socket.on('datareq',dataRequest);

}
function dataRequest(data){

}