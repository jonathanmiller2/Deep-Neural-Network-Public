const tulind = require('tulind');
const constants = require('./Dictionaries/Constants.json');

//This determines how many data points we should give to our indicator calculator
//This is actually used in retrieval.js for efficiency reasons
const indicatorDataPoints = constants.indicatorDataPoints;

//These will hold values oldest @ [0] to newest @ [indicatorDataPoints - 1]
var close = createArray(indicatorDataPoints);
var open = createArray(indicatorDataPoints);
var high = createArray(indicatorDataPoints);
var low = createArray(indicatorDataPoints);
var real = createArray(indicatorDataPoints);
var volume = createArray(indicatorDataPoints);


//This is all of the constant options for all of the different indicators
const adosc_short_period = 3;
const adosc_long_period = 10;

const adx_period = 14;

const adxr_period = 10;

const apo_short_period = 10;
const apo_long_period = 20;

const aroon_period = 25;

const aroonosc_period = 15;

const atr_period = 14;

const bbands_period = 20;
const bbands_stddev = 2;

const cci_period = 20;

const cmo_period = 15;

const cvi_period = 10;

const dema_period = 15;

const di_period = 14;

const dm_period = 14;

const dpo_period = 20;

const dx_period = 15;

const ema_period = 15;

const fisher_period = 9;

const fosc_period = 15;

const hma_period = 15;

const kama_period = 15;

const linreg_period = 15;

const linregintercept_period = 15;

const linregslope_period= 20;

const macd_short_period = 12;
const macd_long_period = 26;
const macd_signal_period = 9;

const mass_period = 25;

const md_period = 15;

const mfi_period = 15;

const mom_period = 15;

const msw_period = 15;

const natr_period = 15;

const ppo_short_period = 12;
const ppo_long_period = 26;

const psar_acceleration_factor_step = 0.02;
const psar_acceleration_factor_maximum = 0.2;

const qstick_period = 15;

const roc_period = 12;

const rocr_period = 15;

const rsi_period = 14;

const sma_period = 15;

const stoch_k_period = 15;
const stoch_k_slowing_period = 10;
const stock_d_period = 3;

const stochrsi_period = 15;

const tema_period = 15;

const trima_period = 15;

const trix_period = 15;

const tsf_period = 15;

const ultosc_short_period = 10;
const ultosc_medium_period = 15;
const ultosc_long_period = 20;

const vhf_period = 15;

const vidya_short_period = 10;
const vidya_long_period = 20;
const vidya_alpha = 1;

const volatilityindicator_period = 15;

const vosc_short_period = 10;
const vosc_long_period = 20;

const vwma_period = 15;

const wilders_period = 15;

const willr_period = 15;

const wma_period = 15;

const zlema_period = 15;

const fillIndicatorData = (newDoc, trimmedAndSorted) =>
{

	close = trimmedAndSorted.map((obj) =>
	{
		return parseFloat(obj.close);
	}); 

	open = trimmedAndSorted.map((obj) =>
	{
		return parseFloat(obj.open);
	}); 

	high = trimmedAndSorted.map((obj) =>
	{
		return parseFloat(obj.high);
	}); 

	low = trimmedAndSorted.map((obj) =>
	{
		return parseFloat(obj.low);
	}); 

	real = trimmedAndSorted.map((obj) =>
	{
		return parseFloat(obj.real);
	}); 


	volume = trimmedAndSorted.map((obj) =>
	{
		return parseFloat(obj.volume);
	}); 

	close[indicatorDataPoints - 1] = parseFloat(newDoc["4. close"]);
	open[indicatorDataPoints - 1] = parseFloat(newDoc["1. open"]);
	high[indicatorDataPoints - 1] = parseFloat(newDoc["2. high"]);
	low[indicatorDataPoints - 1] = parseFloat(newDoc["3. low"]);
	real[indicatorDataPoints - 1] = parseFloat(newDoc["4. close"]);
	volume[indicatorDataPoints - 1] = parseFloat(newDoc["5. volume"]);

	//Indicators break when volume is 0
	for(let i = 0; i < volume.length; i++)
	{
		if(!volume[i])
		{
			volume[i] = 1;
		}
	}


	//Indicators break when high = low
	for(let i = 0; i < high.length; i++)
	{
		if(high[i] == low[i])
		{
			high[i] += .01;
			low[i] -= .01
		}
	}

}


//Percent difference between two numbers
const rel = (in1, in2) =>
{
	let numer = in1 - in2;
	let denom = (in1 + in2) / 2;

	if(!denom)
	{
		denom = 1;
	}

	let res = numer / denom;

	if(!res && res !== 0)
	{
		console.log("Error in rel function, tried to return an undefined value");
		console.log("in1:", in1, " in2", in2);
		console.log("numer:", numer, "denom:", denom);
		console.log("res:", res);

		let stack = new Error().stack;
		console.log(stack);
		debugger;
		process.exit();
	}

	return res;
}


const calPriceChange = () =>
{
	let denom = (real[real.length - 1] + real[real.length - 2]) / 2;
	let res = (real[real.length - 1] - real[real.length - 2]) / denom;

	return res;
}

const calVolume = (newDoc, prevDoc) =>
{
	if(newDoc && prevDoc)
	{
		return newDoc.totalVolume - prevDoc.totalVolume;	
	}
	else
	{
		return 0;
	}
}

const calAD = () =>
{	
	var res;

	tulind.indicators.ad.indicator([high, low, close, volume], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res
}

const calADOSC = () =>
{	
	var res;

	tulind.indicators.adosc.indicator([high, low, close, volume], [adosc_short_period, adosc_long_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calADX = () =>
{	
	var res;

	tulind.indicators.adx.indicator([high, low, close], [adx_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The ADX has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 25;
			}
		}
	}
	
	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
	
		debugger;
		process.exit();
	}

	return res;
}

const calADXR = () =>
{	
	var res;

	tulind.indicators.adx.indicator([high, low, close], [adxr_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	
	//The ADXR has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 29;
			}
		}
	}
	

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calAO = () =>
{	
	var res;

	tulind.indicators.ao.indicator([high, low], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calAPO = () =>
{	
	var res;

	tulind.indicators.apo.indicator([real], [apo_short_period, apo_long_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calAROON = () =>
{	
	var res;

	tulind.indicators.aroon.indicator([high, low], [aroon_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calAROONOSC = () =>
{	
	var res;


	console.log();

	tulind.indicators.aroonosc.indicator([high, low], [aroonosc_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calATR = () =>
{	
	var res;

	tulind.indicators.atr.indicator([high, low, close], [atr_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calBOP = () =>
{	
	var res;

	tulind.indicators.bop.indicator([open, high, low, close], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calCCI = () =>
{	
	var res;

	tulind.indicators.cci.indicator([high, low, close], [cci_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The CMO has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 2.9;
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calCMO = () =>
{	
	var res;

	tulind.indicators.cmo.indicator([real], [cmo_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The CMO has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 1.29;
			}
		}
	}


	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calCVI = () =>
{	
	var res;

	tulind.indicators.cvi.indicator([high, low], [cvi_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calDI = () =>
{	
	var res;

	tulind.indicators.di.indicator([high, low, close], [di_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calDM = () =>
{	
	var res;

	tulind.indicators.dm.indicator([high, low], [dm_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calDPO = () =>
{	
	var res;

	tulind.indicators.dpo.indicator([real], [dpo_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calDX = () =>
{	
	var res;

	tulind.indicators.dx.indicator([high, low, close], [dx_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The DX has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 24;
			}
		}
	}



	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calEMV = () =>
{	
	var res;

	tulind.indicators.emv.indicator([high, low, volume], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(isNaN(res[0][res[0].length - 1]))
	{
		return 0;
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calFISHER = () =>
{	
	var res;

	tulind.indicators.fisher.indicator([high, low], [fisher_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calFOSC = () =>
{	
	var res;

	tulind.indicators.fosc.indicator([real], [fosc_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calLINREGINTERCEPT = () =>
{	
	var res;

	tulind.indicators.linregintercept.indicator([real], [linregintercept_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calLINREGSLOPE = () =>
{	
	var res;

	tulind.indicators.linregslope.indicator([real], [linregslope_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calMACD = () =>
{	
	var res;

	tulind.indicators.macd.indicator([real], [macd_short_period, macd_long_period, macd_signal_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calMARKETFI = () =>
{	
	var res;

	tulind.indicators.marketfi.indicator([high, low, volume], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calMASS = () =>
{	
	var res;

	tulind.indicators.mass.indicator([high, low], [mass_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The MASS has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 24.9;
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calMFI = () =>
{	
	var res;

	tulind.indicators.mfi.indicator([high, low, close, volume], [mfi_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The MFI has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 51.7;
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calMOM = () =>
{	
	var res;

	tulind.indicators.mom.indicator([real], [mom_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calMSW = () =>
{	
	var res;

	tulind.indicators.msw.indicator([real], [msw_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calNATR = () =>
{	
	var res;

	tulind.indicators.natr.indicator([high, low, close], [natr_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calNVI = () =>
{	
	var res;

	tulind.indicators.nvi.indicator([close, volume], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calOBV = () =>
{	
	var res;

	tulind.indicators.obv.indicator([close, volume], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calPPO = () =>
{	
	var res;

	tulind.indicators.ppo.indicator([real], [ppo_short_period, ppo_long_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calPVI = () =>
{	
	var res;

	tulind.indicators.pvi.indicator([close, volume], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The PVI has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 1181;
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calQSTICK = () =>
{	
	var res;

	tulind.indicators.qstick.indicator([open, close], [qstick_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calROC = () =>
{	
	var res;

	tulind.indicators.roc.indicator([real], [roc_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calROCR = () =>
{	
	var res;

	tulind.indicators.rocr.indicator([real], [rocr_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calRSI = () =>
{	
	var res;

	tulind.indicators.rsi.indicator([real], [rsi_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The RSI has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 50;
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calSTOCH = () =>
{	
	var res;

	tulind.indicators.stoch.indicator([high, low, close], [stoch_k_period, stoch_k_slowing_period, stock_d_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calSTOCHRSI = () =>
{	
	var res;

	tulind.indicators.stochrsi.indicator([real], [stochrsi_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	});

	//The VHF has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 0.5;
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calTR = () =>
{	
	var res;

	tulind.indicators.tr.indicator([high, low, close], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calTRIX = () =>
{	
	var res;

	tulind.indicators.trix.indicator([real], [trix_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calULTOSC = () =>
{	
	var res;

	tulind.indicators.ultosc.indicator([high, low, close], [ultosc_short_period, ultosc_medium_period, ultosc_long_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("ULTOSC fucked up");
		debugger;
		process.exit();
	}

	return res;
}

const calVHF = () =>
{	
	var res;

	tulind.indicators.vhf.indicator([real], [vhf_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 


	//The VHF has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 0.4;
			}
		}
	}


	if(!verifyOutput(res))
	{
		console.log("VHF fucked up");
		debugger;
		process.exit();
	}

	return res;
}

const calVOLATILITYINDICATOR = () =>
{	
	var res;

	tulind.indicators.volatility.indicator([real], [volatilityindicator_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	});


	//TODO: Figure out the real reason this is bricking?

	//The volatility has a tendency to brick (?)
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{
				//Otherise just assign it to the average for the indicator
				res[0][i] = 0.4;
			}
		}
	} 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calVOSC = () =>
{	
	var res;

	tulind.indicators.vosc.indicator([volume], [vosc_short_period, vosc_long_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calWAD = () =>
{	
	var res;

	tulind.indicators.wad.indicator([high, low, close], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calWILLR = () =>
{	
	var res;

	tulind.indicators.willr.indicator([high, low, close], [willr_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calAVGPRICE = () =>
{	
	var res;

	tulind.indicators.avgprice.indicator([open, high, close, low], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calBBANDS = () =>
{	
	var res;

	tulind.indicators.bbands.indicator([real], [bbands_period, bbands_stddev], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	

	//The volatility has a tendency to brick (?)
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				//Assign it to whatever the last period was
				res[0][i] = res[0][i - 1];
			}
			else
			{

				//Otherise just assign it to the price itself
				res[0][i] = real[(real.length - res[0].length) + i];
			}
		}
	}

	for (let i = 0; i < res[1].length; i++) 
	{
		if(!isFinite(res[1][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[1][i - 1]))
			{
				//Assign it to whatever the last period was
				res[1][i] = res[1][i - 1];
			}
			else
			{
				//Otherise just assign it to the price itself
				res[1][i] = real[(real.length - res[1].length) + i];
			}
		}
	}

	for (let i = 0; i < res[2].length; i++) 
	{
		if(!isFinite(res[2][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[2][i - 1]))
			{
				//Assign it to whatever the last period was
				res[2][i] = res[2][i - 1];
			}
			else
			{
				//Otherise just assign it to the price itself
				res[2][i] = real[(real.length - res[2].length) + i];
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calDEMA = () =>
{	
	var res;

	tulind.indicators.dema.indicator([real], [dema_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

//Custom calculate with a specfic period
const cCalDEMA = (d, p) =>
{	
	var res;

	if(d === "real")
	{
		tulind.indicators.dema.indicator([real], [p], function(err, results) 
		{
  			if(err)
			{
				console.log("Error in indicator!");
				console.log(err);
				process.exit();
			}
	
			res = results;
		}); 
	}
	else
	{
		tulind.indicators.dema.indicator([d], [p], function(err, results) 
		{
  			if(err)
			{
				console.log("Error in indicator!");
				console.log(err);
				process.exit();
			}
	
			res = results;
		}); 
	}
	
	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calEMA = () =>
{	
	var res;

	tulind.indicators.ema.indicator([real], [ema_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	} 

	return res;
}

//Custom calculate
const cCalEMA = (d, p) =>
{	
	var res;

	if(d === "real")
	{
		d = real;
	}

	tulind.indicators.ema.indicator([d], [p], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	} 

	return res;
}

const calHMA = () =>
{	
	var res;

	tulind.indicators.hma.indicator([real], [hma_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calKAMA = () =>
{	
	var res;

	tulind.indicators.kama.indicator([real], [kama_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calLINREG = () =>
{	
	var res;

	tulind.indicators.linreg.indicator([real], [linreg_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calMEDPRICE = () =>
{	
	var res;

	tulind.indicators.medprice.indicator([high, low], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	} 

	return res;
}

const calPSAR = () =>
{	
	var res;

	tulind.indicators.psar.indicator([high, low], [psar_acceleration_factor_step, psar_acceleration_factor_maximum], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calSMA = () =>
{	
	var res;

	tulind.indicators.sma.indicator([real], [sma_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	} 

	return res;
}

//Custom calculate
const cCalSMA = (d, p) =>
{	
	var res;

	if(d === "real")
	{
		d = real;
	}

	tulind.indicators.sma.indicator([d], [p], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	} 

	return res;
}

const calTEMA = () =>
{	
	var res;

	tulind.indicators.tema.indicator([real], [tema_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	});

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calTRIMA = () =>
{	
	var res;

	tulind.indicators.trima.indicator([real], [trima_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	} 

	return res;
}

const calTSF = () =>
{	
	var res;

	tulind.indicators.tsf.indicator([real], [tsf_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calTYPPRICE = () =>
{	
	var res;

	tulind.indicators.typprice.indicator([high, low, close], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	} 

	return res;
}

const calVIDYA = () =>
{	
	var res;

	tulind.indicators.vidya.indicator([real], [vidya_short_period, vidya_long_period, vidya_alpha], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	//The VIDYA (uses the CMO) has a tendency to brick when no highs/lows arise for a while
	for (let i = 0; i < res[0].length; i++) 
	{
		if(!isFinite(res[0][i]))
		{
			//If we can assign it to whatever the last period was
			if(isFinite(res[0][i - 1]))
			{
				res[0][i] = res[0][i - 1];	
			}
			else
			{
				//Otherise just assign it to the price itself
				res[0][i] = real[(real.length - res[0].length) + i];
				debugger;
			}
		}
	}

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calVWMA = () =>
{	
	var res;

	tulind.indicators.vwma.indicator([close, volume], [vwma_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calWCPRICE = () =>
{	
	var res;

	tulind.indicators.wcprice.indicator([high, low, close], [], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calWILDERS = () =>
{	
	var res;

	tulind.indicators.wilders.indicator([real], [wilders_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calWMA = () =>
{	
	var res;

	tulind.indicators.wma.indicator([real], [wma_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
		process.exit();
	}

	return res;
}

const calZLEMA = () =>
{	
	var res;

	tulind.indicators.zlema.indicator([real], [zlema_period], function(err, results) 
	{
  		if(err)
		{
			console.log("Error in indicator!");
			console.log(err);
			process.exit();
		}

		res = results;
	}); 

	if(!verifyOutput(res))
	{
		console.log("An indicator fucked up");
		
		debugger;
debugger;
		process.exit();
	}

	return res;
}

const calCROSSOVERS = (arr1, arr2) =>
{

	//if arr2 is a constant turn it into a filled array of arr1 length
	//THEN CLEAN UP THIS MESS!

	if(arr2 === "real")
	{
		arr2 = real;
	}

	if(!Array.isArray(arr2))
	{
		arr2 = new Array(arr1.length).fill(arr2);
	}

	var cU = -1;
	var cD = -1;
	var cR = 69;


	//The arrays are lined up by the end, like so
	//arr1 *****************
	//arr2          ********
	//cU of 3 means      ^

	//Newest element in both arrays
	var arr1Index = arr1.length - 1;
	var arr2Index = arr2.length - 1;

	while(true)
	{
		//Check if cU isn't yet defined
		if(cU === -1)
		{
			//Check if arr1 crossed to above arr2 since i-1
			if(arr1[arr1Index] >= arr2[arr2Index] && arr1[arr1Index - 1] < arr2[arr2Index - 1])
			{
				//We calculate this as periods SINCE crossover
				//If we have 20 documents old->new, and a crossover happened in the 15th, then it happened 5 periods ago
				cU = arr1.length - 1 - arr1Index;
			}
		}

		//Check if cD isn't yet defined
		if(cD === -1)
		{
			//Check if arr1 crossed to above arr2 since i-1
			if(arr2[arr2Index] >= arr1[arr1Index] && arr2[arr2Index - 1] < arr1[arr1Index - 1])
			{
				//We calculate this as periods SINCE crossover
				//If we have 20 documents old->new, and a crossover happened in the 15th, then it happened 5 periods ago
				cD = arr1.length - 1 - arr1Index;
			}
		}

		//When we reach the end of one of the arrays
		if(arr1Index <= 1 || arr2Index <= 1)
		{
			break;
		}
		else
		{
			arr1Index--;
			arr2Index--;
		}


		//Check if both of them are defined
		if((cU !== -1) && (cD !== -1))
		{
			break;
		}
	}

	//If cU STILL isn't defined yet, then there are no crosses in the whole period
	if(cU === -1)
	{
		cU = Math.min(arr1.length, arr2.length);
	}

	//If cD STILL isn't defined yet, then there are no crosses in the whole period
	if(cD === -1)
	{
		cD = Math.min(arr1.length, arr2.length);
	}


	//If the cross up is more recent (less periods since)
	if(cU < cD)
	{
		cR = 1;
	}
	//If the cross down is more recent
	else if(cD < cU)
	{
		cR = -1;
	}
	//If they both didn't happen in the period
	else if(cD === Math.min(arr1.length, arr2.length) && cU === Math.min(arr1.length, arr2.length))
	{
		if(cU === 1 && cD === 1)
		{
			debugger;
		}
		cR = 0;
	}
	//If they happen at the same time?
	else
	{
		console.log("My crossover method is very broken! Two lines can't cross each other in two ways at the same time!");
		process.exit();
	}



	return [cU, cD, cR];
}

function createArray(length) 
{
    var arr = new Array(length || 0).fill(0),
        i = length;

    if (arguments.length > 1) 
    {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

const verifyOutput = (res) =>
{
	for(var i = 0; i < res.length; i++)
	{
		if(isNaN(res[i][res[i].length-1]))
		{
			return false;
		}
	}

	return true;
}

module.exports =
{
	fillIndicatorData,
	indicatorDataPoints,
	rel,
	calPriceChange,
	calVolume,
	calCROSSOVERS,

	calAD,
	calADOSC,
	calADX,
	calADXR,
	calAO,
	calAPO,
	calAROON,
	calAROONOSC,
	calATR,
	calBOP,
	calCCI,
	calCMO,
	calCVI,
	calDI,
	calDM,
	calDPO,
	calDX,
	calEMV,
	calFISHER,
	calFOSC,
	calLINREGINTERCEPT,
	calLINREGSLOPE,
	calMACD,
	calMARKETFI,
	calMASS,
	calMFI,
	calMOM,
	calMSW,
	calNATR,
	calNVI,
	calOBV,
	calPPO,
	calPVI,
	calQSTICK,
	calROC,
	calROCR,
	calRSI,
	calSTOCH,
	calSTOCHRSI,
	calTR,
	calTRIX,
	calULTOSC,
	calVHF,
	calVOLATILITYINDICATOR,
	calVOSC,
	calWAD,
	calWILLR,

	calAVGPRICE,
	calBBANDS,
	calDEMA,
	cCalDEMA,
	calEMA,
	cCalEMA,
	calHMA,
	calKAMA,
	calLINREG,
	calMEDPRICE,
	calPSAR,
	calSMA,
	cCalSMA,
	calTEMA,
	calTRIMA,
	calTSF,
	calTYPPRICE,
	calVIDYA,
	calVWMA,
	calWCPRICE,
	calWILDERS,
	calWMA,
	calZLEMA
};