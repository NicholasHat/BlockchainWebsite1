const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Vote{
    constructor(fromAddress, toAddress, votes) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.votes = votes;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.votes).toString();
    }

    signVote(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('you cannot sign votes for other voters');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER()
    }

    isValid() {
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this vote');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, votes, previousHash = '') {
        this.timestamp = timestamp;
        this.votes = votes;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

     hasValidVotes() {
        for(const vt of this.votes) {
            if(!vt.isValid()) {
                return false;
            }
        }
        return true;
     }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingVotes = [];
    }

    createGenesisBlock() {
        return new Block("06/21/2024", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length-1];
    }

    minePendingVotes() {
        let block = new Block(Date.now(), this.pendingVotes, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        console.log('block successfully mined');
        this.chain.push(block);
        this.pendingVotes = [];
    }

    addVote(vote) {

        if(!vote.fromAddress || !vote.toAddress) {
            throw new Error('Vote must include from and to addres');
        }

        if(!vote.isValid()) {
            throw new Error('Cannot add invalid vote to chain');
        }
        this.pendingVotes.push(vote);
    }

    getVotesOfAddress(address) {
        let numVotes = 0;
        for(const block of this.chain) {
            for(const vt of block.votes) {
                //check which candidates address is on the vote
                if(vt.fromAddress === address) {
                    numVotes -= vt.votes;
                }
                if(vt.toAddress === address) {
                    numVotes += vt.votes;
                }
            }
        }

        return numVotes;
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidVotes()) {
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Vote = Vote;