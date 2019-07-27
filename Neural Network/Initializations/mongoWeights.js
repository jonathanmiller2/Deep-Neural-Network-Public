const {MongoClient, ObjectID} = require('mongodb');
const constants = require('../Dictionaries/Constants.json');

var nodeCounts = constants.nodeCounts;
const layerCount = nodeCounts.length - 1;
const maxNodes = nodeCounts[0] + 1;
const maxConnections = nodeCounts[1] + 1;

const instantiate = async () =>
{
	try
	{
		client = await MongoClient.connect('mongodb://localhost:27017/TodoApp');
		var db = client.db('StockData');	
	}
	catch(err)
	{
		console.log("\n----Database Connection Failed!----");
		console.log(err.stack);
		console.log("\n");
	}
	console.log('Starting');

	
	await db.collection('_SUPERPARAMS').updateOne(
	{
		network:'Main'
	},
	{
		$set:
		{
			Ti:50,
			results: [{x:100, y:100}]
		}
	},
	{
		upsert: true
	});


	for(var layer = 0; layer < layerCount; layer++)
	{
		for(var node = 1; node <= nodeCounts[layer]; node++)
		{
			//We start with .5 as it is the default bias. Biases go in the 0th index.
			var weightArr = [0.5];
			var velocityArr = [0];

			for(var connection = 1; connection <= nodeCounts[layer + 1]; connection++)
			{ 
				var newWeight;
				if(layer == 0)
				{
					newWeight = normalRandomInRange(-1, 1);
				}
				else
				{
				 	newWeight = normalRandomInRange(-1, 1) * Math.sqrt(2 / (nodeCounts[layer - 1]));
				}

				if(isNaN(newWeight))
				{
					debugger;
					console.log("A new weight was going to be NaN!");
					process.exit();
				}

				weightArr.push(newWeight);
				velocityArr.push(0);
			}	
		

			//Initialzes biases according to He-et-al Initialization (http://deepdish.io/2015/02/24/network-initialization/)
			await db.collection('_WEIGHTS').updateOne(
			{
				firstIndex:layer,
				secondIndex:node,
			},
			{
				$set:	
				{
					weight:weightArr
				}
			},
			{
				upsert: true
			});
	
	
			//Initializes velocities of weights to be 0
			await db.collection('_VELOCITIES').updateOne(
			{
				firstIndex:layer,
				secondIndex:node,
			},
			{
				$set:	
				{
					velocity:velocityArr
				}
			},
			{
				upsert: true
			});
		}

		console.log('Finished layer:', layer);
	}

	process.exit();
}

var spareRandom = null;

function normalRandom()
{
	var val, u, v, s, mul;

	if(spareRandom !== null)
	{
		val = spareRandom;
		spareRandom = null;
	}
	else
	{
		do
		{
			u = Math.random()*2-1;
			v = Math.random()*2-1;

			s = u*u+v*v;
		} while(s === 0 || s >= 1);

		mul = Math.sqrt(-2 * Math.log(s) / s);

		val = u * mul;
		spareRandom = v * mul;
	}
	
	return val / 14;	// 7 standard deviations on either side
}

function normalRandomInRange(min, max)
{
	var val;
	do
	{
		val = normalRandom();
	} while(val < min || val > max);
	
	return val;
}


instantiate();