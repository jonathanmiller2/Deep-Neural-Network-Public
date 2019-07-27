const {MongoClient, ObjectID} = require('mongodb');
const constants = require('../Dictionaries/Constants.json');

const cacheCount = constants.cacheCount;
const cacheMaxDocCount = constants.cacheMaxDocCount;

const start = async () =>
{
	var startTime = Date.now();

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
	

	for(var i = 0; i < cacheCount; i++)
	{
		await db.collection(`Cache${i}`).drop().catch(() =>
		{
			console.log("Collection doesn't exist to drop");
		});

		await db.createCollection(`Cache${i}`, 
		{
			capped: true,
			size: 5000000,
			max: cacheMaxDocCount
		});

		console.log("Completed cache #", i);
	}
	
	console.log("Finished");
	process.exit();
}


start();