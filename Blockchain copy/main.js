const {Blockchain, Vote} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('9d067499f299691af670766e2d1eb156af29417a37198bfed22854d5bddebb86');
const voter = myKey.getPublic('hex');

const candidatePriv = ec.keyFromPrivate('b94128d6157d99854a403fdc390086ea2cd8a8e95762319c75fa6fac2239426d');
const candidatePub = candidatePriv.getPublic('hex');

let ballot = new Blockchain();

const tx1 = new Vote(voter, candidatePub, 1);

tx1.signVote(myKey);

ballot.addVote(tx1);


console.log('\nStarting the miner... ');
ballot.minePendingVotes(voter);

console.log('\nNumber of votes Candidate has is', ballot.getVotesOfAddress(candidatePub));


console.log(ballot.isChainValid());

console.log(ballot);

//