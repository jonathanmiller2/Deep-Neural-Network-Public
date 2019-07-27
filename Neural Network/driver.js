const fs = require('fs');
const axios = require('axios');
const excel = require('exceljs');
const {MongoClient, ObjectID} = require('mongodb');

const nn = require('./nn.js');
const pop = require('./populator.js');
const indic = require('./indicators.js');
const constants = require('./Dictionaries/Constants.json');

let db;

//Behavioural flags 
const allowTrain = true;
const allowScan = true;
const allowNewData = true;


//Cache information
const cacheCount = constants.cacheCount;
const cacheMaxDocCount = constants.cacheMaxDocCount;

//Train constants
const periodsRequiredByNN = constants.periodsRequiredByNN;		
const trainingSetSize = cacheCount;							//Training set size is how many times we calculate the gradient before applying it


//This is how many data points will be passed to the indicators
//Higher values mean more accuracy for things such as moving averages, but that makes it much more computationally expensive
const indicatorDataPoints = constants.indicatorDataPoints;

//The amount of periods we need to start off the indicators 
//This value has to be higher than indicatorDataPoints, otherwise we won't have enough periods to start calculating the indicators
const indicatorStartupPeriods = constants.indicatorStartupPeriods;


const requestsPerMinute = constants.requestsPerMinute;


const Main = async () =>
{
	console.log('Starting Driver');

	//Database setup
	try
	{
		client = await MongoClient.connect('mongodb://localhost:27017/stock', {useNewUrlParser: true});
		db = client.db('StockData');
	}
	catch(err)
	{
		console.log("\n----Database Connection Failed!----");
		console.log(err.stack);
		console.log("\n");
	}

	//NN Startup
	await nn.NNSetup(db);

	//The state machine
	while(true)
	{
		await newData();
		console.log("Transitioning from data acquisition to pre-scan training");
		await train(1);
		console.log("Transitioning from pre-scan training to scan");
		await scanCaches();
		// await scanAll();
		console.log("Transitioning from scan to post-scan training");
		await train(2);
		console.log("Transitioning from post-scan training to data acquisition");
	}
}


const newData = async () =>
{
	if(!allowNewData)
	{
		return;
	}

	await pop.populate(0);

	return;
}



const train = async (transition) =>
{
	if(!allowTrain)
	{
		return;
	}


	//Incrementor declarations
	let startBatchInc = 0;			//A batch is a group of documents we pass to the nn. The batches are of size (periodsRequiredByNN)
	let cacheInc = 0;
	let	trainingSetInc = 0;


	let storedDocs;
	let nextPeriod;

	//We need to figure out what the minimum number of documents in a cache is
	let res;
	let minimumPeriods = cacheMaxDocCount;
	for(let i = 0; i < cacheCount; i++)
	{
		docCount = await db.collection(`Cache${cacheInc}`).countDocuments();
		if(docCount < minimumPeriods)
		{
			minimumPeriods = docCount;
		}
	}
	console.log("The smallest cache has", minimumPeriods, "documents.");

	//Training main loop
	while(true)
	{
		console.log('Using old documents from cache:', cacheInc, ' starting at', startBatchInc + 1, 'and ending at', startBatchInc + periodsRequiredByNN + 1);

		//Training documents, oldest to newest
		let storedDocs = await db.collection(`Cache${cacheInc}`).find().toArray();

		//We'll need <periodsRequiredByNN> documents, plus one more, the one more is the period we're trying to predict
		storedDocs = storedDocs.slice(startBatchInc, startBatchInc + periodsRequiredByNN + 1);

		//The ordering should be newest to oldest
		storedDocs.reverse();

		//Pull out the document we're trying to predict
		nextPeriod = storedDocs.shift();

		await nn.fillInput(storedDocs, db);
		await nn.propogate();
		await nn.findGoals(nextPeriod.real, storedDocs[0].real);
		await nn.backpropagate();
		await nn.clearActivations();

		//Move to the next cache
		++cacheInc;

		//If we've reached the end of the caches, move the starting place and reset
		if(cacheInc >= cacheCount)
		{
			//Reset to the first cache
			cacheInc = 0;
			
			//Move the starting place for the batch
			++startBatchInc;
			
			//If we don't have room for the new batch
			if(startBatchInc + periodsRequiredByNN >= minimumPeriods)
			{
				//Reset to the first batch
				startBatchInc = 0;
			}
				
			console.log('New batch starting place:', startBatchInc);
		}

		//Count up the number of times we've trained
		++trainingSetInc;

		//If we've reached the end of our training set s
		if(trainingSetInc >= trainingSetSize)
		{
			//Reset the training set 
			trainingSetInc = 0;

			//Apply the gradients from the training set
			await nn.correction();
		}

		//Get the time
		var d = new Date();
		var w = d.getDay();
		var h = d.getHours();

		//Training only stops on weekdays
		if(w !== 0 && w !== 6)
		{
			//If we're in pre-scan training (1), we only transition out at 6am
			if(transition === 1 && h === 6)
			{
				return;
			}
			//If we're in post-scan training (2), we only transition out at 5pm
			else if(transition === 2 && h === 17)
			{
				return;
			}
		}	
	}
}

//Scan only whats been put into the 500 caches
const scanCaches = async () =>
{
	if(!allowScan)
	{
		return;
	}

	//All of the results as an array of objects with a symbol key and a result key
	let cacheResults = [];

	let s = await db.collection('_SUPERPARAMS').findOne({network:"Main"});
	let symbolArray = s.symbolArray;

	let storedDocs;
	let propRes;
	let resultObj;

	//Clear the file
	await fs.writeFileSync('./RESULTS.txt', '');

	for(let cacheInc = 0; cacheInc < cacheCount; cacheInc++)
	{
		//Training documents, newest to oldest (?)
		storedDocs = await db.collection(`Cache${cacheInc}`).find().sort({$natural:-1}).toArray();


		//Propogate for the symbol
		await nn.fillInput(storedDocs, db);
		propRes = await nn.propogate();
		await nn.clearActivations();

		//Make the object containing symbol and propogation result
		resultObj = 
		{
			symbol:symbolArray[cacheInc],
			propRes
		};

		//Add that object to the result list;
		cacheResults.push(resultObj);
	}

	cacheResults.sort((a, b) =>
	{
		return b.propRes - a.propRes;
	});

	// ==============================

	//Write the results to the stream
	let stream = await fs.createWriteStream('./RESULTS.txt', {flags:'a'});

	//For each result
	for(let i = 0; i < cacheResults.length; i++)
	{
		//Write the symbol and the propogation result
		await stream.write(cacheResults[i].symbol + ":\t" + cacheResults[i].propRes + "\n");	
	}

	//Clean up
	await stream.end();

	//=============================
	
	return;
}

//Scan all of the symbols we have available
const scanAll = async () =>
{
	let workbook = new excel.Workbook();

	await workbook.xlsx.readFile("./ExpandedSymbolList.xlsx");

	let worksheet = await workbook.getWorksheet(1);
	let symb;
	let encodedsymb;
	let NNResultForSymbol;
	let start;
	let elapsed;
	let rowInc = 1;

	let resultArray = [];

	//Clear the file
	await fs.writeFileSync('./RESULTS.txt', '');

	while(worksheet.getCell(`A${rowInc}`))
	{
		start = Date.now()

		symb = worksheet.getCell(`A${rowInc}`)._value["model"]["value"];
		encodedsymb = encodeURIComponent(symb);

		NNResultForSymbol = await scanOneSymbol(encodedsymb);

		//If there isn't enough data for the stock yet, move on to the next one
		if(NNResultForSymbol === "NOT_ENOUGH_PERIODS")
		{
			console.log("Symbol", symb, "doesn't have enough periods to scan yet");
			++rowInc;

			elapsed = Date.now() - start;
			await Timeout((60000 / requestsPerMinute) - elapsed);
			continue;
		}

		//Make the object containing symbol and propogation result
		resultObj = 
		{
			symbol:symb,
			propRes:NNResultForSymbol
		};

		resultArray.push(resultObj);

		++rowInc

		elapsed = Date.now() - start;
		console.log("Scanning ", symb, " took ", elapsed, " milliseconds");
		if(elapsed < (60000 / requestsPerMinute))
		{
			await Timeout((60000 / requestsPerMinute) - elapsed);
		}
	}

	//Sort by the propogation result to get the stocks that are going to increase the most
	resultArray.sort((a, b) =>
	{
		return b.propRes - a.propRes;
	});


	//Write the results to the stream
	const stream = fs.createWriteStream('./RESULTS.txt', {flags:'a'});

	//For each result
	for(let i = 0; i < resultArray.length; i++)
	{
		//Write the symbol and the propogation result
		stream.write(resultArray[i].symbol + ":\t" + resultArray[i].propRes + "\n");
	}

	//Clean up
	stream.end();

	return;

}

//Run the neural network for a single stock without databasing anything, returns the propogation result
//This won't be used in our current (5/17/2019) build of the driver, but it is helpful for future-proofing
const scanOneSymbol = async (symbol) =>
{

	//Highjacking the pop.requestData method in the interest of DRY
	//Find the data for the symbol
	let resultFromAPI = await pop.requestData(symbol);
	resultFromAPI = Object.values(resultFromAPI);

	if(resultFromAPI.length < periodsRequiredByNN + indicatorStartupPeriods)
	{
		return 'NOT_ENOUGH_PERIODS';
	}

	let docArray = [];

	//Loop through the API results, we only need enough periods to start the indicators and calculate the full NN docs
	for(var period = indicatorStartupPeriods + periodsRequiredByNN; period >= 0; period--)
	{
		//If we aren't yet ready to run the indicators, (our document array doesnt yet have enough periods to start), then don't calculate a full document
		//Also, we only want the most recent documents, so we ignore the periods that happen before <periodsRequiredByNN>
		if(docArray.length < indicatorStartupPeriods || period > periodsRequiredByNN)
		{
			docArray.push(
			{
				close:parseFloat(resultFromAPI[period]["4. close"]),
				open:parseFloat(resultFromAPI[period]["1. open"]),
				high:parseFloat(resultFromAPI[period]["2. high"]),
				low:parseFloat(resultFromAPI[period]["3. low"]),
				real:parseFloat(resultFromAPI[period]["4. close"]),
				volume:parseFloat(resultFromAPI[period]["5. volume"]),
			});
		}
		else
		{
			copy = docArray;
			copy = copy.slice((docArray.length - indicatorDataPoints) + 1, docArray.length);

			//The reason we pass the result from the API for a specific period is, the indicators can only calculate the next period if they're given the OHLC for it
			//But docArray holds docs with indicators already calculated, and doesn't hold the next OHLC data
			//So how do we calculate the next period of indicators if docArray doesn't hold the newest OHLC data
			indic.fillIndicatorData(resultFromAPI[period], copy);
			docArray.push(await pop.calculateDoc(resultFromAPI[period]));
			console.log("Calculated Doc #", period, "for symbol", symbol);
		}
	}

	//Only the periods we need for the neural network
	docArray.slice(docArray.length - periodsRequiredByNN, docArray.length);

	//Newest to oldest
	docArray.reverse();

	//Propogate for the symbol
	await nn.fillInput(docArray, db);
	let res = await nn.propogate();
	await nn.clearActivations();

	return res;
}

const Timeout = (ms) => new Promise((res) => setTimeout(res, ms))

Main();