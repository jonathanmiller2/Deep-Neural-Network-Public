const axios = require('axios');
const excel = require('exceljs');

const util = require('util');

const {MongoClient, ObjectID} = require('mongodb');

const indic = require('./indicators.js');
const constants = require('./Dictionaries/Constants.json');

let db;

//Constants regarding how our database is constructed
const cacheCount = constants.cacheCount;
const cacheMaxDocCount = constants.cacheMaxDocCount;

const periodsRequiredByNN = constants.periodsRequiredByNN;


//This is how many data points will be passed to the indicators
//Higher values mean more accuracy for things such as moving averages, but that makes it much more computationally expensive
const indicatorDataPoints = constants.indicatorDataPoints;


//The amount of periods we need to start off the indicators 
//This value has to be higher than indicatorDataPoints, otherwise we won't have enough periods to start calculating the indicators
const indicatorStartupPeriods = constants.indicatorStartupPeriods;

//In order to keep track of which symbols it is that we're using, we'll store them in an array
let symbolArray = [];

//API information
const requestsPerMinute = constants.requestsPerMinute;

//If something stops our script halfway through, we can use startingCache to pick up where we left off
const populate = async (startingCache) =>
{
	console.log('Starting');

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

	let startingTime;
	let elapsed;

	let result; 
	let docArray = [];
	let copy;
	let symbol;
	let s;

	for(let cacheIncrementor = startingCache; cacheIncrementor < cacheCount; cacheIncrementor++)
	{	
		startingTime = Date.now();

		//Clear all documents by dropping collection
		await db.collection(`Cache${cacheIncrementor}`).drop();

		//Recreate collection
		await db.createCollection(`Cache${cacheIncrementor}`, 
		{
			capped: true,
			size: 5000000,
			max: cacheMaxDocCount
		});

		//Pull the symbol array so we can update it
		s = await db.collection('_SUPERPARAMS').findOne({network:"Main"});
		symbolArray = s.symbolArray;


		//Repeat finding data until we find one we can actually fill a cache with
		while(true)
		{
			do
			{
				//Pick a random symbol from our excel doc
				symbol = await pickRandomSymbol();
			}
			while(symbolArray.includes(symbol))

			//Find the data for the symbol
			resultFromAPI = await requestData(symbol);
			resultFromAPI = Object.values(resultFromAPI);

			//If we can't completely fill a cache with the data from the symbol, get a new symbol
			if(resultFromAPI.length < cacheMaxDocCount + indicatorStartupPeriods)
			{
				//Try again
				console.log("Symbol", symbol, "doesn't have enough periods to use yet!");
				await Timeout(60000 / requestsPerMinute);
			}
			else
			{
				//The Symbol is good
				break;
			}
		}

		
		

		//Reset the docArray
		docArray = [];

		//Loop through the API results
		for(var period = resultFromAPI.length - 1; period >= 0; period--)
		{
			//If we aren't yet ready to run the indicators, (our document array doesnt yet have enough periods to start), then don't calculate a full document
			//Also, we only want the most recent documents, so we ignore the periods that happen before the earliest we can hold data (cacheMaxDocCount)
			if(docArray.length < indicatorStartupPeriods || period > cacheMaxDocCount)
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
				docArray.push(await calculateAndInsertDoc(resultFromAPI[period], cacheIncrementor));
				console.log("Inserted Doc #", period, "for symbol", symbol);
			}
		}

		console.log('Finished with symbol', symbol, ' in cache ', cacheIncrementor);


		symbolArray[cacheIncrementor] = symbol;

		//Update the symbol array in the database
		await db.collection('_SUPERPARAMS').updateOne(
		{
			network:'Main'
		},
		{
			$set:
			{
				symbolArray
			}
		},
		{
			upsert: true
		});

		console.log('Updated symbol array');

		//Our API has a maximum requests per minute that we are limited to, this will ensure we don't go over that limit
		elapsed = Date.now() - startingTime;


		console.log('Total populate loop time:', elapsed);	
		if(elapsed < (60000 / requestsPerMinute))
		{
			await Timeout((60000 / requestsPerMinute) - elapsed);
		}
	}
}



const calculateAndInsertDoc = async (result, cacheNumber) =>
{
	//Calculate doc
	let res = await calculateDoc(result);

	//Insert new data into database
	await db.collection(`Cache${cacheNumber}`).insertOne(res);


	//We use the documents to calculate indicators.
	return res;
}


const calculateDoc = async (result) =>
{
	var rawObject =
	{
		real:result["4. close"],
		open:result["1. open"],
		close:result["4. close"],
		high:result["2. high"],
		low:result["3. low"],
		volume:result["5. volume"],
	
		priceChange:indic.calPriceChange(),
		
		AD:indic.calAD()[0],
		ADOSC:indic.calADOSC()[0],
		ADX:indic.calADX()[0],
		ADXR:indic.calADXR()[0],
		AO:indic.calAO()[0],
		APO:indic.calAPO()[0],
		AROON_Down:indic.calAROON()[0],
		AROON_Up:indic.calAROON()[1],
		AROONOSC:indic.calAROONOSC()[0],
		ATR:indic.calATR()[0],
		BOP:indic.calBOP()[0],
		CCI:indic.calCCI()[0],
		CMO:indic.calCMO()[0],
		CVI:indic.calCVI()[0],
		DI_Plus:indic.calDI()[0],
		DI_Minus:indic.calDI()[1],
		DM_Plus:indic.calDM()[0],
		DM_Minus:indic.calDM()[1],
		DPO:indic.calDPO()[0],
		DX:indic.calDX()[0],
		FISHER:indic.calFISHER()[0],
		FISHER_Signal:indic.calFISHER()[1],
		FOSC:indic.calFOSC()[0],
		LINREGINTERCEPT:indic.calLINREGINTERCEPT()[0],
		LINREGSLOPE:indic.calLINREGSLOPE()[0],
		MACD:indic.calMACD()[0],
		MACD_Signal:indic.calMACD()[1],
		MACD_Histo:indic.calMACD()[2],
		MARKETFI:indic.calMARKETFI()[0],
		MASS:indic.calMASS()[0],
		MFI:indic.calMFI()[0],
		MOM:indic.calMOM()[0],
		MSW_Sine:indic.calMSW()[0],
		MSW_Lead:indic.calMSW()[1],
		NATR:indic.calNATR()[0],
		NVI:indic.calNVI()[0],
		OBV:indic.calOBV()[0],
		PPO:indic.calPPO()[0],
		PVI:indic.calPVI()[0],
		QSTICK:indic.calQSTICK()[0],
		ROC:indic.calROC()[0],
		ROCR:indic.calROCR()[0],
		RSI:indic.calRSI()[0],
		STOCH_k:indic.calSTOCH()[0],
		STOCH_d:indic.calSTOCH()[1],
		STOCHRSI:indic.calSTOCHRSI()[0],
		TR:indic.calTR()[0],
		TRIX:indic.calTRIX()[0],
		ULTOSC:indic.calULTOSC()[0],
		VHF:indic.calVHF()[0],
		VOLATILITYINDICATOR:indic.calVOLATILITYINDICATOR()[0],
		VOSC:indic.calVOSC()[0],
		WAD:indic.calWAD()[0],
		WILLR:indic.calWILLR()[0],
	
		AVGPRICE:indic.calAVGPRICE()[0],
		BBANDS_Lower:indic.calBBANDS()[0],
		BBANDS_Middle:indic.calBBANDS()[1],
		BBANDS_Upper:indic.calBBANDS()[2],
		DEMA:indic.calDEMA()[0],
		EMA:indic.calEMA()[0],
		HMA:indic.calHMA()[0],
		KAMA:indic.calKAMA()[0],
		LINREG:indic.calLINREG()[0],
		MEDPRICE:indic.calMEDPRICE()[0],
		PSAR:indic.calPSAR()[0],
		SMA:indic.calSMA()[0],
		TEMA:indic.calTEMA()[0],
		TRIMA:indic.calTRIMA()[0],
		TSF:indic.calTSF()[0],
		TYPPRICE:indic.calTYPPRICE()[0],
		VIDYA:indic.calVIDYA()[0],
		VWMA:indic.calVWMA()[0],
		WCPRICE:indic.calWCPRICE()[0],
		WILDERS:indic.calWILDERS()[0],
		WMA:indic.calWMA()[0],
		ZLEMA:indic.calZLEMA()[0]
	};


	//TODO: Maybe indicators break when we accidentally give them less than <IndicatorStartupPeriod> periods and the undefined's cascade?

	//Crossover calculations
	var crsbADOSCa0 = indic.calCROSSOVERS(rawObject["ADOSC"], 0);
	var crsbADXRaADX = indic.calCROSSOVERS(rawObject["ADXR"], rawObject["ADX"]);
	var crsbAOa0 = indic.calCROSSOVERS(rawObject["AO"], 0);
	var crsbAPOba0 = indic.calCROSSOVERS(rawObject["APO"], 0);
	var crsbAROON_DownaAROON_Up = indic.calCROSSOVERS(rawObject["AROON_Down"], rawObject["AROON_Up"]);
	var crsbAROON_Downa50 = indic.calCROSSOVERS(rawObject["AROON_Down"], 50);
	var crsbAROON_Upa50 = indic.calCROSSOVERS(rawObject["AROON_Up"], 50);
	var crsbCMOa10pCMOSMA = indic.calCROSSOVERS(rawObject["CMO"], indic.cCalSMA(rawObject["CMO"], 10)[0]);
	var crsbDI_MinusaDI_Plus = indic.calCROSSOVERS(rawObject["DI_Minus"], rawObject["DI_Plus"]);
	var crsbDM_MinusaDM_Plus = indic.calCROSSOVERS(rawObject["DM_Minus"], rawObject["DM_Plus"]);
	var crsbFISHERaFISHER_Signal = indic.calCROSSOVERS(rawObject["FISHER"], rawObject["FISHER_Signal"]);
	var crsbLINREGSLOPEa20pLINREGSLOPESMA = indic.calCROSSOVERS(rawObject["LINREGSLOPE"], indic.cCalSMA(rawObject["LINREGSLOPE"], 20)[0]);
	var crsbMACDaMACD_Signal = indic.calCROSSOVERS(rawObject["MACD"], rawObject["MACD_Signal"]);
	var crsbMACDa0 = indic.calCROSSOVERS(rawObject["MACD"],0);
	var crsbMASSa27 = indic.calCROSSOVERS(rawObject["MASS"], 27);
	var crsbMOMa0 = indic.calCROSSOVERS(rawObject["MOM"], 0);
	var crsbMSW_LeadaMSW_sine = indic.calCROSSOVERS(rawObject["MSW_Lead"], rawObject["MSW_Sine"]);
	var crsbNVIa20pNVIEMA = indic.calCROSSOVERS(rawObject["NVI"], indic.cCalEMA(rawObject["NVI"], 20)[0]);
	var crsbPVIa20pPVIEMA = indic.calCROSSOVERS(rawObject["PVI"], indic.cCalEMA(rawObject["PVI"], 20)[0]);
	var crsbQSTICKa0 = indic.calCROSSOVERS(rawObject["QSTICK"], 0);
	var crsbQSTICKa20pQSTICKSMA = indic.calCROSSOVERS(rawObject["QSTICK"], indic.cCalSMA(rawObject["QSTICK"], 20)[0]);
	var crsbROCa0 = indic.calCROSSOVERS(rawObject["ROC"], 0);
	var crsbSTOCH_daSTOCH_k = indic.calCROSSOVERS(rawObject["STOCH_d"], rawObject["STOCH_k"]);
	var crsbTRIXa9pTRIXEMA = indic.calCROSSOVERS(rawObject["TRIX"], indic.cCalEMA(rawObject["TRIX"], 9)[0]);
	var crsbTRIXa0 = indic.calCROSSOVERS(rawObject["TRIX"], 0);
	var crsbWILLRan50 = indic.calCROSSOVERS(rawObject["WILLR"], -50);
	var crsbBBANDS_LoweraReal = indic.calCROSSOVERS(rawObject["BBANDS_Lower"], "real");
	var crsbBBANDS_UpperaReal = indic.calCROSSOVERS(rawObject["BBANDS_Upper"], "real");
	var crsb21pDEMAa55pDEMA = indic.calCROSSOVERS(indic.cCalDEMA("real", 21)[0], indic.cCalDEMA("real", 55)[0]);
	var crsb15pDEMAa21pDEMA = indic.calCROSSOVERS(indic.cCalDEMA("real", 15)[0], indic.cCalDEMA("real", 21)[0]);
	var crsb15pDEMAa55pDEMA = indic.calCROSSOVERS(indic.cCalDEMA("real", 15)[0], indic.cCalDEMA("real", 55)[0]);
	var crsb12pEMAa26pEMA = indic.calCROSSOVERS(indic.cCalEMA("real", 12)[0], indic.cCalEMA("real", 26)[0]);
	var crsbKAMAaReal = indic.calCROSSOVERS(rawObject["KAMA"], "real");
	var crsb10pSMAa40pSMA = indic.calCROSSOVERS(indic.cCalSMA("real", 10)[0], indic.cCalSMA("real", 40)[0]);

	//Relative calculations. Uses only the most recent element (last). Calculates the percent difference between two numbers.
	var relbADXRaADX 						= indic.rel(rawObject["ADXR"][rawObject["ADXR"].length - 1], rawObject["ADX"][rawObject["ADX"].length - 1]);
	var relbAROON_DownaAROON_Up 			= indic.rel(rawObject["AROON_Down"][rawObject["AROON_Down"].length - 1], rawObject["AROON_Up"][rawObject["AROON_Up"].length - 1]);
	var relbAROON_Downa50 					= indic.rel(rawObject["AROON_Down"][rawObject["AROON_Down"].length - 1], 50);
	var relbAROON_Upa50 					= indic.rel(rawObject["AROON_Up"][rawObject["AROON_Up"].length - 1], 50);
	var relbCMOa10pCMOSMA 					= indic.rel(rawObject["CMO"][rawObject["CMO"].length - 1], indic.cCalSMA(rawObject["CMO"], 10)[0][indic.cCalSMA(rawObject["CMO"], 10)[0].length - 1]);
	var relbDI_MinusaDI_Plus 				= indic.rel(rawObject["DI_Minus"][rawObject["DI_Minus"].length - 1], rawObject["DI_Plus"][rawObject["DI_Plus"].length - 1]);
	var relbDM_MinusaDM_Plus 				= indic.rel(rawObject["DM_Minus"][rawObject["DM_Minus"].length - 1], rawObject["DM_Plus"][rawObject["DM_Plus"].length - 1]);
	var relbFISHERaFISHER_Signal 			= indic.rel(rawObject["FISHER"][rawObject["FISHER"].length - 1], rawObject["FISHER_Signal"][rawObject["FISHER_Signal"].length - 1]);
	var relbLINREGSLOPEa20pLINREGSLOPESMA 	= indic.rel(rawObject["LINREGSLOPE"][rawObject["LINREGSLOPE"].length - 1], indic.cCalSMA(rawObject["LINREGSLOPE"], 20)[0][indic.cCalSMA(rawObject["LINREGSLOPE"], 20)[0].length - 1]);
	var relbMACDaMACD_Signal 				= indic.rel(rawObject["MACD"][rawObject["MACD"].length - 1], rawObject["MACD_Signal"][rawObject["MACD_Signal"].length - 1]);
	var relbMASSa27 						= indic.rel(rawObject["MASS"][rawObject["MASS"].length - 1], 27);
	var relbMSW_LeadaMSW_sine 				= indic.rel(rawObject["MSW_Lead"][rawObject["MSW_Lead"].length - 1], rawObject["MSW_Sine"][rawObject["MSW_Sine"].length - 1]);
	var relbNVIa20pNVIEMA 					= indic.rel(rawObject["NVI"][rawObject["NVI"].length - 1], indic.cCalEMA(rawObject["NVI"], 20)[0][indic.cCalEMA(rawObject["NVI"], 20)[0].length - 1]);
	var relbPVIa20pPVIEMA 					= indic.rel(rawObject["PVI"][rawObject["PVI"].length - 1], indic.cCalEMA(rawObject["PVI"], 20)[0][indic.cCalEMA(rawObject["PVI"], 20)[0].length - 1]);
	var relbQSTICKa20pQSTICKSMA 			= indic.rel(rawObject["QSTICK"][rawObject["QSTICK"].length - 1], indic.cCalSMA(rawObject["QSTICK"], 20)[0][indic.cCalSMA(rawObject["QSTICK"], 20)[0].length - 1]);
	var relbSTOCH_daSTOCH_k 				= indic.rel(rawObject["STOCH_d"][rawObject["STOCH_d"].length - 1], rawObject["STOCH_k"][rawObject["STOCH_k"].length - 1]);
	var relbTRIXa9pTRIXEMA 					= indic.rel(rawObject["TRIX"][rawObject["TRIX"].length - 1], indic.cCalEMA(rawObject["TRIX"], 9)[0][indic.cCalEMA(rawObject["TRIX"], 9)[0].length - 1]);
	var relbWILLRan50 						= indic.rel(rawObject["WILLR"][rawObject["WILLR"].length - 1], -50);
	var relbBBANDS_LoweraReal 				= indic.rel(rawObject["BBANDS_Lower"][rawObject["BBANDS_Lower"].length - 1], rawObject["real"]);
	var relbBBANDS_UpperaReal 				= indic.rel(rawObject["BBANDS_Upper"][rawObject["BBANDS_Upper"].length - 1], rawObject["real"]);
	var relb21pDEMAa55pDEMA 				= indic.rel(indic.cCalDEMA("real", 21)[0][indic.cCalDEMA("real", 21)[0].length - 1], indic.cCalDEMA("real", 55)[0][indic.cCalDEMA("real", 55)[0].length - 1]);
	var relb15pDEMAa21pDEMA 				= indic.rel(indic.cCalDEMA("real", 15)[0][indic.cCalDEMA("real", 15)[0].length - 1], indic.cCalDEMA("real", 21)[0][indic.cCalDEMA("real", 21)[0].length - 1]);
	var relb15pDEMAa55pDEMA 				= indic.rel(indic.cCalDEMA("real", 15)[0][indic.cCalDEMA("real", 15)[0].length - 1], indic.cCalDEMA("real", 55)[0][indic.cCalDEMA("real", 55)[0].length - 1]);
	var relb12pEMAa26pEMA 					= indic.rel(indic.cCalEMA("real", 12)[0][indic.cCalEMA("real", 12)[0].length - 1], indic.cCalEMA("real", 26)[0][indic.cCalEMA("real", 26)[0].length - 1]);
	var relbKAMAaReal 						= indic.rel(rawObject["KAMA"][rawObject["KAMA"].length - 1], rawObject["real"]);
	var relb10pSMAa40pSMA 					= indic.rel(indic.cCalSMA("real", 10)[0][indic.cCalSMA("real", 10)[0].length - 1], indic.cCalSMA("real", 40)[0][indic.cCalSMA("real", 40)[0].length - 1]);


	//We're only returning the last element of all of the indicators, but we can't use .pop() because we need the array to be unchanged
	//Therefore we have to manually access the last variable of each array returned by the indicators
	var res =
	{
		real:parseFloat(result["4. close"]),
		open:parseFloat(result["1. open"]),
		close:parseFloat(result["4. close"]),
		high:parseFloat(result["2. high"]),
		low:parseFloat(result["3. low"]),
		volume:parseFloat(result["5. volume"]),

		priceChange:rawObject["priceChange"],


		crsUbADOSCa0:crsbADOSCa0[0],
    	crsDbADOSCa0:crsbADOSCa0[1],
    	crsRbADOSCa0:crsbADOSCa0[2],
	
    	crsUbADXRaADX:crsbAOa0[0],
    	crsDbADXRaADX:crsbAOa0[1],
    	crsRbADXRaADX:crsbAOa0[2],
	
    	crsUbAOa0:crsbAPOba0[0],
    	crsDbAOa0:crsbAPOba0[1],
    	crsRbAOa0:crsbAPOba0[2],
	
    	crsUAPOba0:crsbAPOba0[0],
    	crsDAPOba0:crsbAPOba0[1],
    	crsRAPOba0:crsbAPOba0[2],
	
    	crsUbAROON_DownaAROON_Up:crsbAROON_DownaAROON_Up[0],
    	crsDbAROON_DownaAROON_Up:crsbAROON_DownaAROON_Up[1],
    	crsRbAROON_DownaAROON_Up:crsbAROON_DownaAROON_Up[2],
	
    	crsUbAROON_Downa50:crsbAROON_Downa50[0],
    	crsDbAROON_Downa50:crsbAROON_Downa50[1],
    	crsRbAROON_Downa50:crsbAROON_Downa50[2],
	
    	crsUbAROON_Upa50:crsbAROON_Upa50[0],
    	crsDbAROON_Upa50:crsbAROON_Upa50[1],
    	crsRbAROON_Upa50:crsbAROON_Upa50[2],
	
    	crsUbCMOa10pCMOSMA:crsbCMOa10pCMOSMA[0],
    	crsDbCMOa10pCMOSMA:crsbCMOa10pCMOSMA[1],
    	crsRbCMOa10pCMOSMA:crsbCMOa10pCMOSMA[2],
	
    	crsUbDI_MinusaDI_Plus:crsbDI_MinusaDI_Plus[0],
    	crsDbDI_MinusaDI_Plus:crsbDI_MinusaDI_Plus[1],
    	crsRbDI_MinusaDI_Plus:crsbDI_MinusaDI_Plus[2],
	
    	crsUbDM_MinusaDM_Plus:crsbDM_MinusaDM_Plus[0],
    	crsDbDM_MinusaDM_Plus:crsbDM_MinusaDM_Plus[1],
    	crsRbDM_MinusaDM_Plus:crsbDM_MinusaDM_Plus[2],
	
    	crsUbFISHERaFISHER_Signal:crsbFISHERaFISHER_Signal[0],
    	crsDbFISHERaFISHER_Signal:crsbFISHERaFISHER_Signal[1],
    	crsRbFISHERaFISHER_Signal:crsbFISHERaFISHER_Signal[2],
	
    	crsUbLINREGSLOPEa20pLINREGSLOPESMA:crsbLINREGSLOPEa20pLINREGSLOPESMA[0],
    	crsDbLINREGSLOPEa20pLINREGSLOPESMA:crsbLINREGSLOPEa20pLINREGSLOPESMA[1],
    	crsRbLINREGSLOPEa20pLINREGSLOPESMA:crsbLINREGSLOPEa20pLINREGSLOPESMA[2],
	
    	crsUbMACDaMACD_Signal:crsbMACDaMACD_Signal[0],
    	crsDbMACDaMACD_Signal:crsbMACDaMACD_Signal[1],
    	crsRbMACDaMACD_Signal:crsbMACDaMACD_Signal[2],
	
    	crsUbMACDa0:crsbMACDa0[0],
    	crsDbMACDa0:crsbMACDa0[1],
    	crsRbMACDa0:crsbMACDa0[2],
	
    	crsUbMASSa27:crsbMASSa27[0],
    	crsDbMASSa27:crsbMASSa27[1],
    	crsRbMASSa27:crsbMASSa27[2],
	
    	crsUbMOMa0:crsbMOMa0[0],
    	crsDbMOMa0:crsbMOMa0[1],
    	crsRbMOMa0:crsbMOMa0[2],
	
    	crsUbMSW_LeadaMSW_sine:crsbMSW_LeadaMSW_sine[0],
    	crsDbMSW_LeadaMSW_sine:crsbMSW_LeadaMSW_sine[1],
    	crsRbMSW_LeadaMSW_sine:crsbMSW_LeadaMSW_sine[2],
	
    	crsUbNVIa20pNVIEMA:crsbNVIa20pNVIEMA[0],
    	crsDbNVIa20pNVIEMA:crsbNVIa20pNVIEMA[1],
    	crsRbNVIa20pNVIEMA:crsbNVIa20pNVIEMA[2],
	
    	crsUbPVIa20pPVIEMA:crsbPVIa20pPVIEMA[0],
    	crsDbPVIa20pPVIEMA:crsbPVIa20pPVIEMA[1],
    	crsRbPVIa20pPVIEMA:crsbPVIa20pPVIEMA[2],
	
    	crsUbQSTICKa0:crsbQSTICKa0[0],
    	crsDbQSTICKa0:crsbQSTICKa0[1],
    	crsRbQSTICKa0:crsbQSTICKa0[2],
	
    	crsUbQSTICKa20pQSTICKSMA:crsbQSTICKa20pQSTICKSMA[0],
    	crsDbQSTICKa20pQSTICKSMA:crsbQSTICKa20pQSTICKSMA[1],
    	crsRbQSTICKa20pQSTICKSMA:crsbQSTICKa20pQSTICKSMA[2],
	
    	crsUbROCa0:crsbROCa0[0],
    	crsDbROCa0:crsbROCa0[1],
    	crsRbROCa0:crsbROCa0[2],
	
    	crsUbSTOCH_daSTOCH_k:crsbSTOCH_daSTOCH_k[0],
    	crsDbSTOCH_daSTOCH_k:crsbSTOCH_daSTOCH_k[1],
    	crsRbSTOCH_daSTOCH_k:crsbSTOCH_daSTOCH_k[2],
	
    	crsUbTRIXa9pTRIXEMA:crsbTRIXa9pTRIXEMA[0],
    	crsDbTRIXa9pTRIXEMA:crsbTRIXa9pTRIXEMA[1],
    	crsRbTRIXa9pTRIXEMA:crsbTRIXa9pTRIXEMA[2],
	
    	crsUbTRIXa0:crsbTRIXa0[0],
    	crsDbTRIXa0:crsbTRIXa0[1],
    	crsRbTRIXa0:crsbTRIXa0[2],
	
    	crsUbWILLRan50:crsbWILLRan50[0],
    	crsDbWILLRan50:crsbWILLRan50[1],
    	crsRbWILLRan50:crsbWILLRan50[2],
	
    	crsUbBBANDS_LoweraReal:crsbBBANDS_LoweraReal[0],
    	crsDbBBANDS_LoweraReal:crsbBBANDS_LoweraReal[1],
    	crsRbBBANDS_LoweraReal:crsbBBANDS_LoweraReal[2],
	
    	crsUbBBANDS_UpperaReal:crsbBBANDS_UpperaReal[0],
    	crsDbBBANDS_UpperaReal:crsbBBANDS_UpperaReal[1],
    	crsRbBBANDS_UpperaReal:crsbBBANDS_UpperaReal[2],
	
    	crsUb21pDEMAa55pDEMA:crsb21pDEMAa55pDEMA[0],
    	crsDb21pDEMAa55pDEMA:crsb21pDEMAa55pDEMA[1],
    	crsRb21pDEMAa55pDEMA:crsb21pDEMAa55pDEMA[2],
	
    	crsUb15pDEMAa21pDEMA:crsb15pDEMAa21pDEMA[0],
    	crsDb15pDEMAa21pDEMA:crsb15pDEMAa21pDEMA[1],
    	crsRb15pDEMAa21pDEMA:crsb15pDEMAa21pDEMA[2],
	
    	crsUb15pDEMAa55pDEMA:crsb15pDEMAa55pDEMA[0],
    	crsDb15pDEMAa55pDEMA:crsb15pDEMAa55pDEMA[1],
    	crsRb15pDEMAa55pDEMA:crsb15pDEMAa55pDEMA[2],
	
    	crsUb12pEMAa26pEMA:crsb12pEMAa26pEMA[0],
    	crsDb12pEMAa26pEMA:crsb12pEMAa26pEMA[1],
    	crsRb12pEMAa26pEMA:crsb12pEMAa26pEMA[2],
	
    	crsUbKAMAaReal:crsbKAMAaReal[0],
    	crsDbKAMAaReal:crsbKAMAaReal[1],
    	crsRbKAMAaReal:crsbKAMAaReal[2],
	
    	crsUb10pSMAa40pSMA:crsb10pSMAa40pSMA[0],
    	crsDb10pSMAa40pSMA:crsb10pSMAa40pSMA[1],
    	crsRb10pSMAa40pSMA:crsb10pSMAa40pSMA[2],

    	relbADXRaADX,
		relbAROON_DownaAROON_Up,
		relbAROON_Downa50,
		relbAROON_Upa50,
		relbCMOa10pCMOSMA,
		relbDI_MinusaDI_Plus,
		relbDM_MinusaDM_Plus,
		relbFISHERaFISHER_Signal,
		relbLINREGSLOPEa20pLINREGSLOPESMA,
		relbMACDaMACD_Signal,
		relbMASSa27,
		relbMSW_LeadaMSW_sine,
		relbNVIa20pNVIEMA,
		relbPVIa20pPVIEMA,
		relbQSTICKa20pQSTICKSMA,
		relbSTOCH_daSTOCH_k,
		relbTRIXa9pTRIXEMA,
		relbWILLRan50,
		relbBBANDS_LoweraReal,
		relbBBANDS_UpperaReal,
		relb21pDEMAa55pDEMA,
		relb15pDEMAa21pDEMA,
		relb15pDEMAa55pDEMA,
		relb12pEMAa26pEMA,
		relbKAMAaReal,
		relb10pSMAa40pSMA,
		
		AD:rawObject["AD"][rawObject["AD"].length - 1],
		ADOSC:rawObject["ADOSC"][rawObject["ADOSC"].length - 1],
		ADX:rawObject["ADX"][rawObject["ADX"].length - 1],
		ADXR:rawObject["ADXR"][rawObject["ADXR"].length - 1],
		AO:rawObject["AO"][rawObject["AO"].length - 1],
		APO:rawObject["APO"][rawObject["APO"].length - 1],
		AROON_Down:rawObject["AROON_Down"][rawObject["AROON_Down"].length - 1],
		AROON_Up:rawObject["AROON_Up"][rawObject["AROON_Up"].length - 1],
		AROONOSC:rawObject["AROONOSC"][rawObject["AROONOSC"].length - 1],
		ATR:rawObject["ATR"][rawObject["ATR"].length - 1],
		BOP:rawObject["BOP"][rawObject["BOP"].length - 1],
		CCI:rawObject["CCI"][rawObject["CCI"].length - 1],
		CMO:rawObject["CMO"][rawObject["CMO"].length - 1],
		CVI:rawObject["CVI"][rawObject["CVI"].length - 1],
		DI_Plus:rawObject["DI_Plus"][rawObject["DI_Plus"].length - 1],
		DI_Minus:rawObject["DI_Minus"][rawObject["DI_Minus"].length - 1],
		DM_Plus:rawObject["DM_Plus"][rawObject["DM_Plus"].length - 1],
		DM_Minus:rawObject["DM_Minus"][rawObject["DM_Minus"].length - 1],
		DPO:rawObject["DPO"][rawObject["DPO"].length - 1],
		DX:rawObject["DX"][rawObject["DX"].length - 1],
		FISHER:rawObject["FISHER"][rawObject["FISHER"].length - 1],
		FISHER_Signal:rawObject["FISHER_Signal"][rawObject["FISHER_Signal"].length - 1],
		FOSC:rawObject["FOSC"][rawObject["FOSC"].length - 1],
		LINREGINTERCEPT:rawObject["LINREGINTERCEPT"][rawObject["LINREGINTERCEPT"].length - 1],
		LINREGSLOPE:rawObject["LINREGSLOPE"][rawObject["LINREGSLOPE"].length - 1],
		MACD:rawObject["MACD"][rawObject["MACD"].length - 1],
		MACD_Signal:rawObject["MACD_Signal"][rawObject["MACD_Signal"].length - 1],
		MACD_Histo:rawObject["MACD_Histo"][rawObject["MACD_Histo"].length - 1],
		MARKETFI:rawObject["MARKETFI"][rawObject["MARKETFI"].length - 1],
		MASS:rawObject["MASS"][rawObject["MASS"].length - 1],
		MFI:rawObject["MFI"][rawObject["MFI"].length - 1],
		MOM:rawObject["MOM"][rawObject["MOM"].length - 1],
		MSW_Sine:rawObject["MSW_Sine"][rawObject["MSW_Sine"].length - 1],
		MSW_Lead:rawObject["MSW_Lead"][rawObject["MSW_Lead"].length - 1],
		NATR:rawObject["NATR"][rawObject["NATR"].length - 1],
		NVI:rawObject["NVI"][rawObject["NVI"].length - 1],
		OBV:rawObject["OBV"][rawObject["OBV"].length - 1],
		PPO:rawObject["PPO"][rawObject["PPO"].length - 1],
		PVI:rawObject["PVI"][rawObject["PVI"].length - 1],
		QSTICK:rawObject["QSTICK"][rawObject["QSTICK"].length - 1],
		ROC:rawObject["ROC"][rawObject["ROC"].length - 1],
		ROCR:rawObject["ROCR"][rawObject["ROCR"].length - 1],
		RSI:rawObject["RSI"][rawObject["RSI"].length - 1],
		STOCH_k:rawObject["STOCH_k"][rawObject["STOCH_k"].length - 1],
		STOCH_d:rawObject["STOCH_d"][rawObject["STOCH_d"].length - 1],
		STOCHRSI:rawObject["STOCHRSI"][rawObject["STOCHRSI"].length - 1],
		TR:rawObject["TR"][rawObject["TR"].length - 1],
		TRIX:rawObject["TRIX"][rawObject["TRIX"].length - 1],
		ULTOSC:rawObject["ULTOSC"][rawObject["ULTOSC"].length - 1],
		VHF:rawObject["VHF"][rawObject["VHF"].length - 1],
		VOLATILITYINDICATOR:rawObject["VOLATILITYINDICATOR"][rawObject["VOLATILITYINDICATOR"].length - 1],
		VOSC:rawObject["VOSC"][rawObject["VOSC"].length - 1],
		WAD:rawObject["WAD"][rawObject["WAD"].length - 1],
		WILLR:rawObject["WILLR"][rawObject["WILLR"].length - 1],
	
		rAVGPRICE: 			indic.rel(rawObject["AVGPRICE"][rawObject["AVGPRICE"].length - 1], result["4. close"]),
		rBBANDS_Lower: 		indic.rel(rawObject["BBANDS_Lower"][rawObject["BBANDS_Lower"].length - 1], result["4. close"]),
		rBBANDS_Middle:		indic.rel(rawObject["BBANDS_Middle"][rawObject["BBANDS_Middle"].length - 1], result["4. close"]),
		rBBANDS_Upper:		indic.rel(rawObject["BBANDS_Upper"][rawObject["BBANDS_Upper"].length - 1], result["4. close"]),
		rDEMA:				indic.rel(rawObject["DEMA"][rawObject["DEMA"].length - 1], result["4. close"]),
		rEMA:				indic.rel(rawObject["EMA"][rawObject["EMA"].length - 1], result["4. close"]),
		rHMA:				indic.rel(rawObject["HMA"][rawObject["HMA"].length - 1], result["4. close"]),
		rKAMA:				indic.rel(rawObject["KAMA"][rawObject["KAMA"].length - 1], result["4. close"]),
		rLINREG:			indic.rel(rawObject["LINREG"][rawObject["LINREG"].length - 1], result["4. close"]),
		rMEDPRICE:			indic.rel(rawObject["MEDPRICE"][rawObject["MEDPRICE"].length - 1], result["4. close"]),
		rPSAR:				indic.rel(rawObject["PSAR"][rawObject["PSAR"].length - 1], result["4. close"]),
		rSMA:				indic.rel(rawObject["SMA"][rawObject["SMA"].length - 1], result["4. close"]),
		rTEMA:				indic.rel(rawObject["TEMA"][rawObject["TEMA"].length - 1], result["4. close"]),
		rTRIMA:				indic.rel(rawObject["TRIMA"][rawObject["TRIMA"].length - 1], result["4. close"]),
		rTSF:				indic.rel(rawObject["TSF"][rawObject["TSF"].length - 1], result["4. close"]),
		rTYPPRICE:			indic.rel(rawObject["TYPPRICE"][rawObject["TYPPRICE"].length - 1], result["4. close"]),
		rVIDYA:				indic.rel(rawObject["VIDYA"][rawObject["VIDYA"].length - 1], result["4. close"]),
		rVWMA:				indic.rel(rawObject["VWMA"][rawObject["VWMA"].length - 1], result["4. close"]),
		rWCPRICE:			indic.rel(rawObject["WCPRICE"][rawObject["WCPRICE"].length - 1], result["4. close"]),
		rWILDERS:			indic.rel(rawObject["WILDERS"][rawObject["WILDERS"].length - 1], result["4. close"]),
		rWMA:				indic.rel(rawObject["WMA"][rawObject["WMA"].length - 1], result["4. close"]),
		rZLEMA:				indic.rel(rawObject["ZLEMA"][rawObject["ZLEMA"].length - 1], result["4. close"])
	};

	

	return res;
}




const Timeout = (ms) => new Promise((res) => setTimeout(res, ms))




//Request data from the API
const requestData = async (symbol) =>
{
	var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=QGYAT3AC3DATAXI6`;	
	
	
	let dataResponse;

	//Request stock data.
	try
	{	
		dataResponse = await axios.get(url);	
		arrResults = Object.values(dataResponse.data);
	}
	catch(error)
	{
		console.log(error);
		try {console.log(error.response.data.error);} catch(error){console.log('No error response data!');}
		
		Timeout(60000);
	}


	

	//Return data validation
	if(arrResults.length === 0 || !arrResults[1])
	{
		console.log("No response from API for ticker: " + symbol);
		//Do the request again
		try
		{	
			dataResponse = await axios.get(url);
			arrResults = Object.values(dataResponse.data);
		}
		catch(error)
		{
			console.log(error);
			try {console.log(error.response.data.error);} catch(error){console.log('No error response data!');}
			
			Timeout(60000);
		}

		

		//Return data validation
		if(arrResults.length === 0 || !arrResults[1])
		{
			console.log("No response from API for ticker:", symbol);
			console.log("Removing symbol", symbol);
			debugger;

			//Remove the symbol
			await removeSymbolFromExcel(symbol);
		}

	}
	else
	{
		console.log(symbol + " OK");	
	}
	

	var timeSeries = Object.values(arrResults[1]);

	return timeSeries;
}

const removeSymbolFromExcel = async (symbol) =>
{
	let workbook = new excel.Workbook();
	await workbook.xlsx.readFile("./ExpandedSymbolList.xlsx");
	let worksheet = workbook.getWorksheet(1);

	let column = worksheet.getColumn(1);

	let columnSize = column.values.length - 1;
	debugger;

	for(let i = 0; i < columnSize; i++)
	{
		debugger;
		if(column.values[i].trim() === symbol)
		{
			worksheet.spliceRows(i, 1, "failed");
			await workbook.xlsx.writeFile("../ExpandedSymbolList.xlsx");		
			break;
		}
	}

	console.log("Removed symbol", symbol);
}

const pickRandomSymbol = async () =>
{
	let workbook = new excel.Workbook();
	await workbook.xlsx.readFile("./ExpandedSymbolList.xlsx");
	let worksheet = workbook.getWorksheet(1);

	let column = worksheet.getColumn(1);

	//Find how many we have to choose from
	let columnSize = column.values.length - 1;

	//Pick one of the cells
	let min = 1;
	let max = columnSize;
	let randomCell = Math.floor(Math.random() * (max - min + 1)) + min;

	//Get the symbol from the cell
	let symb = worksheet.getCell(`A${randomCell}`)._value["model"]["value"];

	return symb.trim();
}


module.exports =
{
	populate,
	requestData,
	calculateDoc
}