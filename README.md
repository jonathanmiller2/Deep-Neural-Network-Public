# Deep-Neural-Network-Public
This is a personal deep learning project to demonstrate my own programming skills, learn the calculus behind machine learning, and to make money on the stock market (maybe).
This version of the project is purposefully missing pieces as many of my classmates want to copy my work.

---

### **To potential employers:**
This is one of my most in-depth projects and I believe assembled it best shows my coding style and ability.
The two halves of this project show key facets of my programming skill, which are as follows:

1. Neural Network
  * Core programming principles, such as algorithm design
  * Mathematical principles such as multivariable calculus
  * Complex data structures
  * Research and modernity
2. Data Retrieval and Management
  * Databasing large amounts of data efficiently
  * Interaction between databases and other apps
  * Using APIs to retrieve data
  * Statistical data analysis

Feel free to look around! I used no non-essential libraries so the code is all my own.

---

#### Neural Network

The neural network is designed to take in data from the stock market and spit out a prediction. It mathematically optimizes the connection between the inputs and the outputs. I wrote it in javascript because I wanted to fully understand the math behind AI and because I wanted to keep the full stack in Javascript. 

For those experience with neural networking, the technical attributes are thus:
* Gradient descent optimization scheme
* Leaky RELU activation function (10^-5 inactive multiplier)
* Learning rate scheme: [Stochastic with warm restarts](https://arxiv.org/pdf/1608.03983.pdf)
* [Nesterov Momentum](http://cs231n.github.io/neural-networks-3/)
* Sigmoid normalized inputs
* 100% in Javascript! Full-stack ML development in a single language! No python in sight!

---

#### Data Retrieval and Management

The data retrieval part of the project requests stock data from ~~TD Ameritrade's API~~ AlphaVantage's API and stores it in a MongoDB database. It also calculates all of the indicators necessary for the ML model.

Originally the data was arranged such that each stock had it's own named collection, but then I moved into caches that could hold data for any stock, and which stock the caches used was rotated as the neural network finished. To determine what strings were actually symbols I retrieved a .csv of all of the tradable stocks on the NYSE, which is read in from populator.js.

The database in question also held all of the weights, biases, velocities, as well as the prediction history. These were held in parrallel collections.
  
  
