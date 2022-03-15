    var fs = require("fs");
	var csv = require("fast-csv");
	var logger = fs.createWriteStream('output.csv', {flags: 'w'});
	csv.write([["Steam Username","Steam Password","Email","Email Password","Prime Status","Vac Ban Status","SteamURL"]],{headers:false}).pipe(logger);