// We want to create a script to call the issue token funciton || can be run by command line
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(callback) {
    const tokenFarm = await TokenFarm.deployed();
    await tokenFarm.issueTokens();
    
    console.log('Tokens issued!');
    
    callback();

};