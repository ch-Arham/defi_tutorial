// Put new contracts to blockchain (Blockchain state changes when put new smart contracts on it) migrating the state of BC
// from one state to another

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

// deployer puts the smart contracts on the network (BC)
// network --- The netwrok itself
// accounts --- all the accoutns from ganache (array)
module.exports = async function(deployer, network, accounts) {

    // Deploy Mock DAI Token
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();


    // Deploy Mock Dapp Token
    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();

    // Deploy TokenFarm Contract
    await deployer.deploy(TokenFarm, daiToken.address, dappToken.address);
    const tokenFarm = await TokenFarm.deployed();

    // Transfer all tokens to TokenFarm (1 Million)
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

    // Transfer 100 Mock DAI Token to investors (accounts[1] is the 2nd account in ganache)
    await daiToken.transfer(accounts[1], '100000000000000000000');

};