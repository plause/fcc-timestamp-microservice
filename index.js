var fs = require('fs');
var http = require('http');
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var isUnix = /^[1-9][0-9]*$/;
var isNatural = new RegExp('^(' + months.join('|') + ') ([12]?[0-9]|[0-9]|3[01]), ([1-9][0-9]*)$');
var badParameterOutput = {'unix': null, 'natural': null};
var indexPageFile = fs.readFileSync(__dirname + '/public/index.html', 'utf8');

function populateIfIsUnix(parameter) {
	if (isUnix.test(parameter)) {
		var unix = Number(parameter);
		var date = new Date(unix * 1000);

		return {
			'unix': unix,
			'natural': months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
		};
	}
}

function populateIfIsNatural(parameter) {
	var result = parameter.match(isNatural);

	if (result) {
		var month = months.indexOf(result[1]);

		if (month !== -1) {
			return {
				'unix': Date.UTC(Number(result[3]), month, Number(result[2])) / 1000,
				'natural': parameter
			};
		}
	}
}

function serveTimestampMicroservice(req, res) {
	var parameter = decodeURIComponent(req.url.substring(1));
	var output = populateIfIsUnix(parameter) || populateIfIsNatural(parameter);

	res.end(JSON.stringify(output || badParameterOutput));
}

http.createServer(function (req, res) {
	if (req.url === '/') {
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.end(indexPageFile);
	} else {
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		serveTimestampMicroservice(req, res);
	}
}).listen(process.env.PORT || 5000);
