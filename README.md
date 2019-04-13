# Deep-Neural-Network-Public
This is a personal deep learning project to demonstrate my own programming skills, and to make money on the stock market (maybe).
This version of the project is purposefully missing pieces as it is my intellectual property (and quite valuable nowadays).

---

### **To potential employers:**
This is my magnum opus (thus far!) and I believe assembled it best shows my coding style and ability.
The three sections of this project show three facets of my programming skill, which are as follows:

1. Neural Network
  * Core programming principles, such as algorithm design
  * Research and modernity
2. Website
  * Front-end development (HTML and CSS)
  * Back-end development (Node.js)
3. Data Retrieval
  * Databasing and data management
  * Using APIs

Feel free to look around! I used no non-essential libraries so the code is all my own.

---

#### Neural Network

The neural network is designed to take in data from the stock market and spit out a prediction. It mathematically optimizes the connection between the inputs and the outputs. I wrote it in javascript because I wanted to fully understand the math behind AI and I can keep everything in Javascript. 

For those experience with neural networking, the technical attributes are thus:
* Gradient descent optimization scheme
* Leaky RELU activation function (10^-5 inactive multiplier)
* Learning rate scheme: [Stochastic with warm restarts](https://arxiv.org/pdf/1608.03983.pdf)
* [Nesterov Momentum](http://cs231n.github.io/neural-networks-3/)
* Sigmoid normalized inputs
* **100% in Javascript! Full-stack AI development in a single language! No python in sight!**

---
 
#### Website

The website shows the input weights of the AI as colored squares that are seperated by node. The website makes a (**large**) request to a locally hosted server for all of the weights and renders them in javascript.

---

#### Data Retrieval

The data retrieval part of the project requests stock data from TD Ameritrade's API and stores it in a MongoDB database. It also calculates all of the indicators necessary for the AI.
  
  
