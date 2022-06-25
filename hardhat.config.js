require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('./tasks/tasks.js');
require('dotenv').config();

module.exports = {
	solidity: "0.8.13",
	networks: {
		rinkeby: {
			url: process.env.URL,
			accounts: [process.env.PRIVATE],
		}
	}
};
