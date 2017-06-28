var io;
var socket;

exports.init=function (_io,_socket)
{
	    io=_io;
	    socket=_socket;

    console.log('socket init');

	    socket.emit('mainsocket',{type:'info', data:'socket connected, wait...'});
	// socket.on('dataop', handShake);
    // socket.on('datareq',dataRequest);

};
exports.savePreEvnt=function (evnt) {

    console.log('savePreEvnt foo', evnt);

    io.emit('mainsocket', {type:'newPreEvnt', data: evnt});
    // socket.broadcast.emit('preevnt', evnt);
    // socket.emit('dataop',{op:'addEl'});
    // io.emit('dataop',{op:'addEl'});
};
function dataRequest(data) {

}
