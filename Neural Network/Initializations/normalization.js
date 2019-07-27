const {MongoClient, ObjectID} = require('mongodb');

let db;

const ign = require("../Dictionaries/ignores.js");
const constants = require("../Dictionaries/Constants.json");

const igndict = ign.ignoredVals;
const totalDocs = constants.cacheMaxDocCount;
const cacheCount = constants.cacheCount;

const symbolStart = 0;

const instantiate = async () =>
{
	try
	{
		client = await MongoClient.connect('mongodb://localhost:27017/TodoApp');
		db = client.db('StockData');	
	}
	catch(err)
	{
		console.log("\n----Database Connection Failed!----");
		console.log(err.stack);
		console.log("\n");
	}
	console.log('Starting');

	let symbol;

	let muSum = {};
	let muTotal = {};
	let muVals = {};

	let sigSum = {};
	let sigTotal = {};
	let sigVals = {};

	//Iterate over the caches
	for(let cacheInc = symbolStart; cacheInc <= cacheCount; cacheInc++)
	{	

		let storedDocuments = await db.collection(`Cache${cacheInc}`).find().sort({$natural:-1}).toArray();

		//Documents
		for(let docNumber = 0; docNumber < totalDocs; docNumber++) 
		{

			//Indicators
			for(let indic in storedDocuments[docNumber])
			{
				//We don't want to calculate mu/sig values for things like the object ID.
				if(igndict.includes(indic))
				{
					continue;
				}

				//If it has already been initialized
				if(muSum[indic] && sigSum[indic] && muTotal[indic] && sigTotal[indic])
				{
					muSum[indic] += parseFloat(storedDocuments[docNumber][indic]);
					sigSum[indic] += parseFloat(storedDocuments[docNumber][indic]) ** 2;

					muTotal[indic]++;
					sigTotal[indic]++;
				}
				else
				{
					muSum[indic] = parseFloat(storedDocuments[docNumber][indic]);
					sigSum[indic] = parseFloat(storedDocuments[docNumber][indic]) ** 2;

					muTotal[indic] = 1;
					sigTotal[indic] = 1;
				}

				//Check for falsy values other than 0 in any of the objects for this indic
				if((!muSum[indic] && muSum[indic] !== 0) || (!muTotal[indic] && muTotal[indic] !== 0) || (!sigSum[indic] && sigSum[indic] !== 0) || (!sigTotal[indic] && sigTotal[indic] !== 0))
				{
					debugger;
					console.log("Falsy value!");
					process.exit();
				}
			}
		}

		console.log('Finished with cache', cacheInc);
	}

	debugger;


	//Calculate the actual mu/sig vals
	//Cache loop
	for(let cacheInc = 0; cacheInc <= cacheCount; cacheInc++)
	{	
		for(let indic in muSum)
		{
			muVals[indic] = parseFloat(muSum[indic]) / parseFloat(muTotal[indic]);
			sigVals[indic] = parseFloat(sigSum[indic]) / parseFloat(sigTotal[indic]);
		}
	}
	

	debugger;

	await db.collection('_SUPERPARAMS').updateOne(
	{
		network:'Main'
	},
	{
		$set:
		{
			mu:muVals,
			sig:sigVals
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
    let arr = new Array(length || 0).fill(0),
        i = length;

    if (arguments.length > 1) 
    {
        let args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

instantiate();