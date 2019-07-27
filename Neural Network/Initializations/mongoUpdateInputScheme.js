const {MongoClient, ObjectID} = require('mongodb');

const is = require("../Dictionaries/InputScheme.js")

const updateInputScheme = async () =>
{
	console.log("Starting.");

	try
	{
		client = await MongoClient.connect('mongodb://localhost:27017/', {useNewUrlParser: true});
		db = client.db('StockData');	
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
			inputScheme:is.inputScheme
		}
	},
	{
		upsert: true
	});

	console.log("Updated.");
	process.exit();
}

//We put this here in case we want to run this to update the mongoDB input scheme for the website
//We won't use the mongoDB version of this list at all in the main project code, but the website does use it
updateInputScheme();