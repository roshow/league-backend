
import { readFileSync, writeFile, createReadStream } from 'fs';
import { Converter } from 'csvtojson';
import request from 'request';

let urls = {
	ultima: `https://docs.google.com/spreadsheets/d/1iM6YRodJyhLqII7BYELNogJYdyJFFN8JGpSg5Y2bdMA/pub?output=csv&gid=0`,
	argent: `https://docs.google.com/spreadsheets/d/1iM6YRodJyhLqII7BYELNogJYdyJFFN8JGpSg5Y2bdMA/pub?output=csv&gid=1526608063`
};
function formatAndWriteToFile (rawmatches, filename='json/matches/ultima-all-formatted.json') {
	console.log(`formatting and writing to file`);
  let formattedmatches = rawmatches.map( (match, i) => (
		{
			week: match.week,
			division: match.division,
			game: (i + 1),
			played: !!match.played,
			gamePlayed: match.played,
			players: [
				{
					name: match.player1.replace(/\s/g, '').toLowerCase(),
					destroyed: match.points1
				},
				{
					name: match.player2.replace(/\s/g, '').toLowerCase(),
					destroyed: match.points2
				}
			]
		}
	));
	writeFile(filename, JSON.stringify(formattedmatches));
}


function convertThoseMatches () {


	let division = ( process.argv[2] === 'ultima' || process.argv[2] === 'argent' ) ? process.argv[2] : false;
	let convertType = ( process.argv[3] === 'url' || process.argv[3] === 'file' ) ? process.argv[3] : false;
	let arg = process.argv[4] || false;

	if (!division || !convertType) {
		console.log('I have no idea what you want me to convert');
		return;
	} 

	
	let converter =  new Converter({ constructResult: true });
	converter.on('end_parsed', function (result) { 
		console.log(result);
		formatAndWriteToFile(result, `json/matches/${division}-all-formatted.json`);
	});


	if (convertType === 'url') {

		let csvUrl = urls[division];
		console.log(`attempting to convert from ${csvUrl}`);
		request.get(csvUrl).pipe(converter);

	}
	else if (convertType === 'file' && arg) {

		createReadStream(arg).pipe(converter);

	}

}

convertThoseMatches();

 



