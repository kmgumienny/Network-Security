var http = require('http');

//create a server object:
http.createServer(function (req, res) {
  // res.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
  // res.setHeader('Foo', 'bar');
  // res.setHeader('Date', 'Wed, 04 Dec 2019 12:33:55 GMT');
  var newDate = new Date();
  var dayStr = (newDate.toString().substring(0,3));
  var month = (newDate.toString().substring(4,8));
  var dayNum = (newDate.toString().substring(8,11));
  var year = (newDate.toString().substring(11,16));
  var date = dayStr + ', ' + dayNum + month + year + '12:12:12 GNT'; 
  // var date = (newDate.toString().substring(0,16) + "12:12:12 GNT");
  // Date: Wed, 04 Dec 2019 23:00:26 GMT
  //       Wed, 04 Dec 2019 12:12:12 GNT
  res.setHeader('Date', date);
  // res.setHeader('FullDate', date);
  res.end(); //end the response
}).listen(80); //the server object listens on port 80
