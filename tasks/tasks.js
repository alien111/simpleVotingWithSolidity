require("@nomiclabs/hardhat-ethers");

task("getAmountOfPolls", "Get amount of polls").setAction(async (taskArgs) => {

	const Voting = await hre.ethers.getContractFactory("Voting");
	const voting = await Voting.attach("0xa8E542cB9c47Fa31503f97D2E71138908a41E3EF");

	const ans = await voting.getAmountOfPolls();

	console.log(ans);
	

});

task("addVoting", "Add voting").addParam("accounts", "List of accounts separated with ;").setAction(async (taskArgs) => {

	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.attach("0xa8E542cB9c47Fa31503f97D2E71138908a41E3EF");

	let splitted = taskArgs.accounts.split(";");

	await voting.addVoting(splitted);

});

task("getPollInfo", "Get poll info by id").addParam("poll", "Poll id", undefined, types.int).setAction(async (taskArgs) => {

	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.attach("0xa8E542cB9c47Fa31503f97D2E71138908a41E3EF");

	const ans = await voting.getPollInfo(taskArgs.poll);

	console.log(ans);

});

task("getPollCandidates", "Get poll candidates by id").addParam("poll", "Poll id", undefined, types.int).setAction(async (taskArgs) => {

	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.attach("0xa8E542cB9c47Fa31503f97D2E71138908a41E3EF");

	const ans = await voting.getPollCandidates(taskArgs.poll);

	console.log(ans);

});

task("vote", "Vote in a poll").addParam("poll", "Poll id", undefined, types.int).addParam("candidate", "Candidate address", undefined, types.string).setAction(async (taskArgs) => {

	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.attach("0xa8E542cB9c47Fa31503f97D2E71138908a41E3EF");

	const ans = await voting.vote(taskArgs.poll, taskArgs.candidate, {value: ethers.utils.parseEther("0.01")});

	console.log(ans);

});

task("finalizePoll", "Finalize poll").addParam("poll", "Poll id", undefined, types.int).setAction(async (taskArgs) => {

	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.attach("0xa8E542cB9c47Fa31503f97D2E71138908a41E3EF");

	await voting.finalizePoll(taskArgs.poll);

});

task("withdrawFees", "Withdraw fees").setAction(async (taskArgs) => {

	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.attach("0xa8E542cB9c47Fa31503f97D2E71138908a41E3EF");

	await voting.withdrawFees();

});