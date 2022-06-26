const { assert } = require('chai');

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai').use(require('chai-as-promised')).should();

// Using web3
// A web3 instance is available in each test file, configured to the correct provider. So calling web3.eth.getBalance just works!


const tokens = n => {
    return web3.utils.toWei(n.toString(), 'ether');
}

// Instead of passing acounts we destructure it
contract('TokenFarm', ([owner, investor]) => {
    // Write Tests Here....
    
    // Before - It's a hook to run before the first it() or describe(); only once
    let daiToken, dappToken, tokenFarm;
    before(async function () {
        // Get Instances of new Contracts (Load Contracts)
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(daiToken.address, dappToken.address);

        // Transfer all Dapp Tokens to Token Farm (1 Million)
        await dappToken.transfer(tokenFarm.address, tokens(1000000));

        // Transfer 100 DAI Tokens to Investor (accounts[1] --> investor is the 2nd account in ganache)
        // In the test we have to pass meta data that who is calling the function
        await daiToken.transfer(investor, tokens(100), { from: owner });


    });
    
    // 1- Check Wheter All Contracts were Deployed Correctly
    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token');            
        })
    })

    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token');
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm');
        })

        // Has All the Tokens Transfered to it
        it('Contract has all the tokens', async ()=>{
            const balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens(1000000));
        })
    })

    describe('Farming Tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result;
            // Check Investor Balance Before Staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens(100), 'Investor does not have correct mock Dai tokens before staking');

            // Approve before they can stake
            await daiToken.approve(tokenFarm.address, tokens(100), { from: investor });
            // Stake mock dai tokens
            await tokenFarm.stakeTokens(tokens(100), { from: investor });

            //check staking result
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens(0), 'Investor does not have correct mock Dai tokens after staking');

            // To check that stakingBalance is correct
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens(100), 'Investor does not have correct staking balance after staking');
            
            // Curent Staking Status is true
            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'true', 'Investor is not staking');

            // Issue Tokens
            await tokenFarm.issueTokens({from: owner});

            // Check balance after tokens were issued
            result = await dappToken.balanceOf(investor);
            assert.equal(result.toString(), tokens(100), 'Investor dapp wallet balance is not correct after issuingtokens');

            // Ensure that only owner can call function
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            // unstake tokens
            await tokenFarm.unstakeTokens({ from: investor });

            // check results after unstaking for investor
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens(100), 'investor mockdai wallet not correct after unstaking');

            // check results after unstaking of token farm
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens(0), 'Token Farm mockdai wallet not correct after unstaking');

            // check results after unstaking for token farm staking balance
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens(0), 'investor staking balance not correct after unstaking');

            // Investor is no longer staking
            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'false', 'investor staking status not correct after unstaking');

        })
    })
})
