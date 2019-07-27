var nodeCounts = [518, 200, 100, 25, 1, 0];
const layerCount = nodeCounts.length - 1;

const express = require('express');
var app = express();
const port = process.env.PORT || 3000;
const {MongoClient, ObjectID} = require('mongodb');


app.use(express.static(__dirname + '/public'));

const Init = async () =>
{
	console.log('Init server');

	try
	{
		client = await MongoClient.connect('mongodb://localhost:27017/stock', {useNewUrlParser: true});
		app.locals.db = client.db('StockData');	
	}
	catch(err)
	{
		console.log("\n----Database Connection Failed!----");
		console.log(err.stack);
		console.log("\n");
	}

	console.log("Finished init");
}

Init();

app.get('/', (req, res) =>
{
	res.sendFile( __dirname + '/index.html');
});

app.get('/sendW', async (req, res) =>
{
	console.log('Received request');

	let s = await app.locals.db.collection('_SUPERPARAMS').findOne({network:"Main"});

	var arr = [s.inputScheme];

	for(let node = 1; node <= nodeCounts[0]; node++)
	{	
		var wArr;

		let r = await app.locals.db.collection('_WEIGHTS').findOne({firstIndex:0,secondIndex:node});
		wArr = r.weight;

		console.log('Found weight for:', node);

		arr.push(wArr);
	}

	console.log('Finished request');
	/*The format for the above constructed array is as such:
	arr[1] = object containing all of the weights leaving the first node
	arr[2] = object containing all of the weights leaving the second node
	etc..
	*/

	res.send(arr);
});

app.get('/sendR', async (req, res) =>
{
	console.log('Received request');

	let ret = await app.locals.db.collection('_SUPERPARAMS').findOne({network:"Main"});

	res.send(ret.results);
});

app.listen(port, () => 
{
	console.log(`Listening on ${port}!`);
});


