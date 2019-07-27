//This contains the values that go into mongoDB documents that we DON'T want to use in our neural network

const ignoredVals =
[
	"_id",
	"timestamp",
	"TRASH"
]

module.exports =
{
	ignoredVals
}