const is = require("./Dictionaries/InputScheme.js");
const constants = require('./Dictionaries/Constants.json');

//Structure definition (modular)
var nodeCounts = constants.nodeCounts;
const layerCount = nodeCounts.length - 1;
const maxNodes = nodeCounts[0] + 1;
const maxConnections = nodeCounts[1] + 1;

//Arrays for various types of data
var data = createArray(layerCount, maxNodes, maxConnections);
var	activations = createArray(layerCount, maxNodes);
var	partials = createArray(layerCount, maxNodes);
var	zTotals = createArray(layerCount, maxNodes);
var	gradients =  createArray(layerCount, maxNodes, maxConnections);

//Database to be used
var db;

//Storage for results and goals
var result;
var goal;

//Variables for error indicator
var pErr = createArray(500); //500 samples for the error calculation
var cErr = 0;

//Learning rate parameters. The learning rate is based on pg.4 of the paper "SGDR: Stochastic Gradient Descent with warm restarts" (https://arxiv.org/pdf/1608.03983.pdf)
//WORKING LRATE MAX: 0.00000002
const LRateMax = 1e-12;
const LRateMin = 1e-19;
const tMult = 2; 
var T = 279;
var Ti;

//Momentum perameters. The momentum is based on "CS231n Convolutional Neural Networks for Visual Recognition" (http://cs231n.github.io/neural-networks-3/)
const mu = 0.5;
var vel =  createArray(layerCount, maxNodes, maxConnections);
const decayRate = 0.005;

//Gradient clipping
const clipGradient = false;
const clipmax = 0.01;

//Learning counter for personal analysis.
var epoch = 0;

//Variables for accuracy statistics
const statCutoffOffset = 3; //This one determines how strong a signal must be for us to count it as a pos/neg signal
var falsepos = 0;
var truepos = 0;
var falseneg = 0;
var trueneg = 0;
var totalpos = 0;
var totalneg = 0;

var inputScheme = is.inputScheme;

const NNSetup = async (pdb) =>
{
	db = pdb;

	//Database connection circumvented by passing db
	console.log('Starting NNSetup');

	let startTime = Date.now();

	//Connection weight & bias input input
	for(let layer = 0; layer < layerCount; layer++)
	{
		for(let node = 1; node <= nodeCounts[layer]; node++)
		{
			//The first layer isn't fed through the RELU, and therefor has no bias.
			if(layer > 0)
			{
				let bias = await db.collection('_WEIGHTS').findOne({firstIndex:layer, secondIndex:node});
				data[layer][node][0] = bias.weight[0];	
				let v = await db.collection('_VELOCITIES').findOne({firstIndex:layer,secondIndex:node});
				vel[layer][node][0] = v.velocity[0];
			}
			

			for(let connection = 1; connection <= nodeCounts[layer + 1]; connection++)
			{
				let rWeight = await db.collection('_WEIGHTS').findOne({firstIndex:layer,secondIndex:node});
				data[layer][node][connection] = rWeight.weight[connection];
				let v = await db.collection('_VELOCITIES').findOne({firstIndex:layer,secondIndex:node});
				vel[layer][node][connection] = v.velocity[connection];
			}
		}
	}


	//Inputting superparameters
	superParams = await db.collection('_SUPERPARAMS').findOne({network:"Main"});
	Ti = superParams.Ti;

	if(!Ti)
	{
		console.log("Ti isn't truthy!");
		debugger;
		process.exit();
	}


	//Connection weight & bias input complete
	let elapsed = Date.now() - startTime;
	console.log('NNSetup complete. That took', elapsed, "milliseconds.");
};




const propogate = async () =>
{
	//Start summing!
	// 1 to layerCount-1 we exclude the input layer because this algorithm calculates activations using the PREVIOUS layer. The input layer doesn't have a previous layer.
	for(let layer = 1; layer <= layerCount - 1; layer++)
	{
		for(let node = 1; node <= nodeCounts[layer]; node++)
		{
			let total = 0

			//Here we're iterating through the nodes on the previous layer to add up all of their activations going to the current node
			for(let prevNode = 1; prevNode <= nodeCounts[layer - 1]; prevNode++)
			{	
				if(!isNaN(activations[layer - 1][prevNode]))
				{
					//Add to the individual activation total: 	(the weight * the input)
					total += (data[layer - 1][prevNode][node] * activations[layer - 1][prevNode]);
				}
				else
				{
					console.log('An Activation was NaN!');
				}
			}

			zTotals[layer][node] = total + data[layer][node][0];	

			//Total activation  	 = RELU(sum of individual activations + bias);
			activations[layer][node] = RELU(total + data[layer][node][0]);


			if(isNaN(activations[layer][node]))
			{
				console.log('A total activation was NaN');
				process.exit();
			}
		}
	}

	//Finished summing
	result = activations[layerCount - 1][1];

	//Remember, 0-200 with 100 being no change
	console.log("Propogation result is:", result);
	return result;
};



const findGoals = async (newPrice, oldPrice) =>
{

	//100 is no change, 0-100 is down, 100-200 is up.
	goal = ((newPrice - oldPrice) / oldPrice) * 100 + 100;

	console.log('Goal:', goal);


	//Accuracy Calculations
	var nErr = Math.pow(goal - activations[layerCount - 1][1], 2);
	let tot = 0;

	pErr.unshift(nErr);
	pErr.pop();

	pErr.forEach((x) =>
	{
		tot += x;
	});

	if(nErr > 1e10)
	{
		debugger;
	}

	cErr = tot / pErr.length;
	console.log("Current error:", cErr);

};



const backpropagate = async () =>
{

	//For backpropogation, the naming scheme is as follows:
	// layer 0 : input layer
	// layer 1 : second layer
	// layer 2 : third layer
	// layer 3 : output layer

	printStats();

	addResult(goal, result);
	


	let startTime = Date.now();

	for(var oNode = 1; oNode <= nodeCounts[layerCount - 1]; oNode++)
	{
		//This code technically only executes once, because we only have one output node. However, I'm keeping it here in case there are multiple oNodes in the future
		//In that case, result will be changed to an array results[oNode] and goal will be changed to an array goals[oNode]
		partials[layerCount - 1][oNode] = 2 * (result - goal);

		gradients[layerCount - 1][oNode][0] += partials[layerCount - 1][oNode] * dRELU(zTotals[layerCount - 1][oNode]);
	}


	for(var layer = layerCount - 1; layer > 0; layer--)
	{
		//Iterate through nodes on Current layer
		for(var cNode = 1; cNode <= nodeCounts[layer]; cNode++)  
		{
			//Iterate through nodes on Previous layer
			for(var pNode = 1; pNode <= nodeCounts[layer - 1] ; pNode++)
			{
				gradients[layer - 1][pNode][cNode] += partials[layer][cNode] * dRELU(zTotals[layer][cNode]) * activations[layer - 1][pNode];
	
				gradients[layer][cNode][0] += partials[layer][cNode] * dRELU(zTotals[layer][cNode]);
				
				//Partials stores the partial derivative up to a given node
				partials[layer - 1][pNode] += partials[layer][cNode] * dRELU(zTotals[layer][cNode]) * data[layer - 1][pNode][cNode];

			}
		}
	}
}



const correction = async () =>
{
	//Set up learning constants.
	let learningRate = (LRateMin + .5 * (LRateMax - LRateMin) * (1 + Math.cos(Math.PI * (T / Ti))));
	++T;

	if(isNaN(learningRate))
	{
		debugger;
		console.log('LRate is NaN!');
		process.exit();
	}

	//Expand Ti (period of cos function)
	if(T === Ti)
	{
		T = 0;

		await db.collection('_SUPERPARAMS').findOneAndUpdate({network:"Main"},
		{
			$mul:
			{
				Ti: tMult
			}
		});
	}
	console.log('Current T: ', T, '\n Current LRate:', learningRate);

	
	++epoch;
	await Timeout(1000);
	console.log('Epoch:', epoch);

	
	for(let layer = 0; layer <= layerCount - 1; layer++)
	{
		for(let node = 1; node <= nodeCounts[layer]; node++)
		{
			for(let connection = 0; connection <= nodeCounts[layer + 1]; connection++)
			{
				//x is the current weight, g is the gradient
				let x = data[layer][node][connection];
				let g = gradients[layer][node][connection];


				if(isNaN(x))
				{
					console.log(`A data node is NaN!!!!!!! The node was ${layer}, ${node}, ${connection}`);
					debugger;
					process.exit();
				}

				if(isNaN(g))
				{
					console.log(`The gradient at a data node is NaN!!!!!!! The node was ${layer}, ${node}, ${connection}`);
					debugger;
					process.exit();
				}


				//This applies weight decay to the gradient. App stands for applied. 
				//let app = (-1 * learningRate * g) - (learningRate * decayRate * data[layer][node][connection]);


				let v_prev = vel[layer][node][connection];

				vel[layer][node][connection] = (mu * vel[layer][node][connection]) - (learningRate * g);


				//App stands for applied, or the gradient to be applied
				//The first half of this (VVVVVVV) is the momentum implementation,		the second half (VVVVVV) is the decay
				let app = (-mu * v_prev) + ((1 + mu) * vel[layer][node][connection]) - (learningRate * decayRate * x);


				if(isNaN(app))
				{
					console.log('The value about to be applied was NaN!');
					debugger;
					process.exit();
				}				

				//Gradient clipping
				if(app > clipmax && clipGradient)
				{
					console.log("A gradient was clipped. Gradient was:", app);
					app = clipmax;
				}
				else if(app < -clipmax && clipGradient)
				{
					console.log("A gradient was clipped. Gradient was:", app);
					app = -clipmax;
				}

				//console.log('About to increment weight at', layer, node, connection, 'by value: ', app);

				//For instance usage
				data[layer][node][connection] += app;

				

				gradients[layer][node][connection] = 0;
			}

			//For database	
			await db.collection('_WEIGHTS').updateOne({firstIndex:layer,secondIndex:node},
			{
				$set:
				{
					weight: data[layer][node]
				}
			});


			await db.collection('_VELOCITIES').updateOne({firstIndex:layer,secondIndex:node},
			{
				$set:
				{
					velocity: vel[layer][node]
				}
			},
			{
				upsert:true
			});
		}
	}
	console.log('The NN weights and biases have been updated in the database.');
}



const clearActivations = async () =>
{
	//The input layer doesn't have partial activations. Just a total. That total is overwritten anyways so we don't need to worry about it.
	for(var layer = 1; layer < layerCount; layer++)
	{
		for(var node = 1; node <= nodeCounts[layer]; node++)
		{
			activations[layer][node] = 0;
			partials[layer][node] = 0;
			zTotals[layer][node] = 0;		
		}
	}
}

const printStats = () =>
{
	//Reset when the values get too large
	if(totalpos > 100000 || totalneg > 100000)
	{
		falsepos = 0;
		truepos = 0;
		falseneg = 0;
		trueneg = 0;
		totalpos = 0;
		totalneg = 0;
	}


	//This is for personal analysis, and can be removed
	if(result > 100 + statCutoffOffset)
	{
		totalpos++;

		if(goal > 100)
		{
			truepos++;
		}
		else if(goal < 100)
		{
			falsepos++;
		}
		else
		{
			totalpos--;
		}
	}

	console.log("The current number of true positives is:", truepos);
	console.log("The current number of false positives is:", falsepos);

	if(result < 100 - statCutoffOffset)
	{
		totalneg++

		if(goal < 100)
		{
			trueneg++;
		}
		else if(goal > 100)
		{
			falseneg++;
		}
		else
		{
			totalneg--;
		}
	}

	console.log("The current number of true negatives is:", trueneg);
	console.log("The current number of false negatives is:", falseneg);
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


const Timeout = (ms) => new Promise((res) => setTimeout(res, ms))


const RELU = (input) =>
{
	//The 0.00001 is the leakyness factor of the RELU
	if(input > 0)
	{
		return input;
	}
	else
	{
		return 0.00001 * input;
	}
}

const dRELU = (input) =>
{
	//The 0.001 is the leakyness factor of the RELU
	if(input > 0)
	{
		return 1;
	}
	else
	{
		return 0.00001;
	}
}

const fillInput = async (arrayOfDocuments, db) =>
{	
	//Retrieve the normalization constants
	var s = await db.collection('_SUPERPARAMS').findOne({network:"Main"});
	var mu = s["mu"];
	var sig = s["sig"];

	//Iterate over each input specified by the input scheme
	for(var currentInputNode = 1; currentInputNode < inputScheme.length; currentInputNode++)
	{
		//The input scheme is set up with string in the format "RSI 5"
		//When we split by the space, the name becomes index 0, and the period becomes index 1.
		var splitScheme = inputScheme[currentInputNode].split(" ");

		var name = splitScheme[0];
		var period = splitScheme[1];


		if(sig[name] != 0)
		{
			//Divide off the mu, then divide by sig
			var corrected = (arrayOfDocuments[period][name] - mu[name]) / sig[name];
		}
		else
		{
			//Sometimes (rarely) the variance (sig) is zero, so we have to account for that
			var corrected = 0;
		}

		//Assign the corrected activation
		activations[0][currentInputNode] = corrected;


		//Ensure it was initialized
		if(!activations[0][currentInputNode] && activations[0][currentInputNode] != 0)
		{
			console.log("An input was falsy and nonzero!");
			console.log("Name: ", name);
			console.log("Period: ", period);
			console.log("Node", currentInputNode);
			debugger;
			process.exit();
		}
	}
	
	//Warn if the inputScheme isn't aligned with the first layer nodes
	if(inputScheme.length - 1 != nodeCounts[0])
	{
		console.log("============================WARNING============================");
		console.log("First layer node count isn't the same as input scheme size!!!");
		console.log("Input scheme size is:", inputScheme.length - 1);
		console.log("============================WARNING============================");
		debugger;
		process.exit();
	}
}

const addResult = async(goal, actual) =>
{

	let ret = await db.collection('_SUPERPARAMS').findOne({network:"Main"});
	let retR = ret.results;	

	if(retR.length >= 1000)
	{
		retR.shift();
	}

	retR.push(
	{
		x: goal,
		y: actual
	});


	await db.collection('_SUPERPARAMS').updateOne(
	{
		network:'Main'
	},
	{
		$set:
		{
			results:retR
		}
	},
	{
		upsert: true
	});
}

module.exports =
{
	NNSetup,
	fillInput,
	clearActivations,
	findGoals,
	propogate,
	backpropagate,
	correction
};