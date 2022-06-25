const hre = require("hardhat");

async function main() {
	
	const [deployer] = await ethers.getSigners();

	console.log("Deploying with the account: ", deployer.address);

	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.deploy();

	await voting.deployed();

	console.log("Deployed to: ", voting.address);

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
