const { expect } = require("chai");
const { ethers } = require("hardhat");

provider = ethers.provider;

describe("Voting", function () {
	it("Should create voting and send amount of polls", async function () {

		const [owner, a1, a2, a3] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		expect(await voting.getAmountOfPolls()).to.equal(1);

	});

	it("Should correctly define owner", async function() {

		const [owner, a1, a2, a3] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		expect(await voting.owner()).to.equal(owner.address);

	});

	it("Should send poll info", async function () {

		const [owner, a1, a2, a3] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		const lst = await voting.getPollInfo(0);
		expect(lst[0][0]).to.equal(owner.address);
		expect(lst[0][1]).to.equal(a1.address);
		expect(lst[0][2]).to.equal(a2.address);
		expect(lst[0][3]).to.equal(a3.address);
		expect(lst[1]).to.equal(false);
		expect(lst[2]).eq(latestBlock.timestamp);

	});

	it("Should send poll candidates", async function () {

		const [owner, a1, a2, a3] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		const lst = await voting.getPollCandidates(0);

		expect(lst[0]).to.equal(owner.address);
		expect(lst[1]).to.equal(a1.address);
		expect(lst[2]).to.equal(a2.address);
		expect(lst[3]).to.equal(a3.address);

	});

	it("Should vote for candidate", async function () {

		const [owner, a1, a2, a3] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		await voting.vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});

		expect(await provider.getBalance(voting.address)).to.equal(ethers.utils.parseEther("0.01"));

	});

	it("Should revert second vote from 1 account", async function () {

		const [owner, a1, a2, a3, a4, a5, a6, a7] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		await voting.vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});
		await expect(voting.vote(0, a1.address, {value: ethers.utils.parseEther("0.01")})).to.be.revertedWith('Already voted');


	});

	it("Should count votes and distribute bank between winner and contract, should correctly send fees to owner", async function () {

		const [owner, a1, a2, a3, a4, a5, a6, a7] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		const ownerInitialBalance = await provider.getBalance(owner.address);
		const a2InitialBalance = await provider.getBalance(a2.address);

		const tx1 = await voting.vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});
		const receipt1 = await tx1.wait();

		await voting.connect(a1).vote(0, a3.address, {value: ethers.utils.parseEther("0.01")});

		const tx2 = await voting.connect(a2).vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});
		const receipt2 = await tx2.wait();

		await voting.connect(a3).vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a4).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a5).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a6).vote(0, a3.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a7).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")});

		await provider.send("evm_increaseTime", [259200]);

		expect(await provider.getBalance(voting.address)).to.equal(ethers.utils.parseEther("0.08"));
		
		const tx3 = await voting.finalizePoll(0);
		const receipt3 = await tx3.wait();

		expect(await voting.fees()).to.equal(ethers.utils.parseEther("0.008"));

		const a2FinalBalance = await provider.getBalance(a2.address);

		expect(a2FinalBalance.sub(a2InitialBalance).add(ethers.utils.parseEther("0.01")).add(receipt2.gasUsed)).to.equal(ethers.utils.parseEther("0.072"));

		const tx4 = await voting.withdrawFees();
		const receipt4 = await tx4.wait();

		const ownerFinalBalance = await provider.getBalance(owner.address);
		expect(ownerFinalBalance.sub(ownerInitialBalance).add(ethers.utils.parseEther("0.01")).add(receipt1.gasUsed).add(receipt3.gasUsed).add(receipt4.gasUsed)).to.equal(ethers.utils.parseEther("0.008"));

	});

	it("Should finalize poll if someone tries to vote more than 3 days after start", async function () {

		const [owner, a1, a2, a3, a4, a5, a6, a7, a8] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address, a2.address, a3.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		const ownerInitialBalance = await provider.getBalance(owner.address);
		const a2InitialBalance = await provider.getBalance(a2.address);

		const tx1 = await voting.vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});
		const receipt1 = await tx1.wait();

		await voting.connect(a1).vote(0, a3.address, {value: ethers.utils.parseEther("0.01")});

		const tx2 = await voting.connect(a2).vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});
		const receipt2 = await tx2.wait();

		await voting.connect(a3).vote(0, a2.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a4).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a5).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a6).vote(0, a3.address, {value: ethers.utils.parseEther("0.01")});
		await voting.connect(a7).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")});

		await provider.send("evm_increaseTime", [259200]);

		await expect(voting.connect(a8).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")})).to.be.revertedWith('Too late');
		await voting.finalizePoll(0);
		await expect(voting.connect(a8).vote(0, a1.address, {value: ethers.utils.parseEther("0.01")})).to.be.revertedWith('Poll is finished');

	});

	it("Should revert vote if candidate is incorrect", async function () {

		const [owner, a1, a2] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		await expect(voting.vote(0, a2.address, {value: ethers.utils.parseEther("0.01")})).to.be.revertedWith('Incorrect candidate');

	});

	it("Should revert vote if poll number is incorrect", async function() {

		const [owner, a1, a2] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		await expect(voting.vote(1, a1.address, {value: ethers.utils.parseEther("0.01")})).to.be.revertedWith('Poll id > polls amount');

	});

	it("Should revert vote if amount of ethers is incorrect", async function() {

		const [owner, a1, a2] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		await expect(voting.vote(1, a1.address, {value: ethers.utils.parseEther("0.099")})).to.be.revertedWith('Incorrect amount of ethers');

	});

	it("Should revert poll creating, fee withdrawing from anybody except owner", async function() {

		const [owner, a1, a2] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		await expect(voting.connect(a1).addVoting([owner.address, a1.address])).to.be.revertedWith("");
		await expect(voting.connect(a1).withdrawFees()).to.be.revertedWith("");

	});

	it("Should revert poll finalizing if it's too early", async function() {

		const [owner, a1, a2] = await ethers.getSigners();
		const Voting = await ethers.getContractFactory("Voting");
		const voting = await Voting.deploy();
		const checkVotingAdding = await voting.addVoting([owner.address, a1.address]);
		await checkVotingAdding.wait();
		const latestBlock = await hre.ethers.provider.getBlock("latest");

		await expect(voting.finalizePoll(0)).to.be.revertedWith("");

	});


});
