pragma solidity ^0.8.13;

contract Voting {

	address public owner;

	constructor() {
		owner = payable(msg.sender);
	}

	struct Poll {
		address[] candidates;

		mapping(address => uint) address2id;
		mapping(uint => uint) id2numberOfVotes;

		address[] alreadyVoted;
		bool isFinished;
		uint start;
		uint winningVotesAmount;
		address winner;
	}

	Poll[] polls;
	uint public fees = 0;

	function getAmountOfPolls() external view returns(uint) {
		return polls.length;
	}

	function getPollInfo(uint poll) external view returns(address[] memory, bool, uint) {
		address[] memory _candidates = new address[](polls[poll].candidates.length);
		for (uint i = 0; i < polls[poll].candidates.length; i ++) {
			_candidates[i] = polls[poll].candidates[i];
		}

		return (_candidates, polls[poll].isFinished, polls[poll].start);
	}

	function getPollCandidates(uint poll) external view returns(address[] memory) {
		address[] memory candidates = new address[](polls[poll].candidates.length);

		candidates = polls[poll].candidates;

		return candidates;
	}

	function checkIfVoted(uint poll, address voter) internal view returns(bool) {

		for (uint i = 0; i < polls[poll].alreadyVoted.length; i++) {
			if (polls[poll].alreadyVoted[i] == voter) return true;
		}

		return false;

	}

	function isThereACandidate(uint poll, address potentialCandidate) internal view returns(bool) {

		if (polls[poll].address2id[potentialCandidate] != 0) {
			return true;
		}

		return false;

	}

	function finalizePoll(uint poll) external payable {

		require(block.timestamp > polls[poll].start + 3 days);

		polls[poll].isFinished = true;

		uint amountOfWei = polls[poll].alreadyVoted.length * 10000000000000000;

		payable(polls[poll].winner).transfer(amountOfWei * 9 / 10);

		fees += amountOfWei - amountOfWei * 9 / 10;

	}

	function withdrawFees() external payable {

		require(msg.sender == owner);

		payable(owner).transfer(fees);

	}
	
	function addVoting(address[] calldata _candidatesAddresses) external {

		require(msg.sender == owner);

		uint position = polls.length;
		polls.push();
		Poll storage p = polls[position];

		p.isFinished = false;
		p.start = block.timestamp;

		for (uint i = 0; i < _candidatesAddresses.length; i ++) {
			p.candidates.push(_candidatesAddresses[i]);
			p.address2id[_candidatesAddresses[i]] = i + 1;
		}

	}

	function vote(uint poll, address voteForCandidate) external payable returns(bool) {

		require(msg.value == 10000000000000000, "Incorrect amount of ethers");
		require(poll < polls.length, "Poll id > polls amount");
		require(checkIfVoted(poll, msg.sender) == false, "Already voted");
		require(polls[poll].isFinished == false, "Poll is finished");
		require(isThereACandidate(poll, voteForCandidate) == true, "Incorrect candidate");
		require(block.timestamp < polls[poll].start + 3 days, "Too late");

		polls[poll].id2numberOfVotes[polls[poll].address2id[voteForCandidate]]++;
		polls[poll].alreadyVoted.push(msg.sender);

		if (polls[poll].id2numberOfVotes[polls[poll].address2id[voteForCandidate]] > polls[poll].winningVotesAmount) {
			polls[poll].winningVotesAmount = polls[poll].id2numberOfVotes[polls[poll].address2id[voteForCandidate]];
			polls[poll].winner = voteForCandidate;
		}

		return true;

	}

}