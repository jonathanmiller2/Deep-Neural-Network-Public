const {MongoClient, ObjectID} = require('mongodb');

const constants = require('../Dictionaries/Constants.json');
 
const cacheCount = constants.cacheCount;

const instantiate = async () =>
{
	console.log('Starting');

	try
	{
		client = await MongoClient.connect('mongodb://localhost:27017/');
		var db = client.db('StockData');	
	}
	catch(err)
	{
		console.log("\n----Database Connection Failed!----");
		console.log(err.stack);
		console.log("\n");
	}
	
	await db.collection('_SUPERPARAMS').updateOne(
	{
		network:'Main'
	},
	{
		$set:
		{
			Ti:50,
			results: [{x:100, y:100}],
			symbolArray: createArray(cacheCount)
		}
	},
	{
		upsert: true
	});

	console.log("Finished");
	process.exit();
}


function createArray(length) 
{
    var arr = new Array(length || 0).fill("blank"),
        i = length;

    if (arguments.length > 1) 
    {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}


instantiate();