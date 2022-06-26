pragma solidity ^0.5.0;

import './DaiToken.sol';
import './DappToken.sol';

contract TokenFarm{
    string public name = "Dapp Token Farm";
    address public owner;
    DaiToken public daiToken;
    DappToken public dappToken;

    // Array to keep track of all the addresses that have ever staked (as we have to issue them rewards later)
    address[] public stakers;

    // How much each investor is staking
    mapping (address => uint) public stakingBalance;
    
    // Investor has staked
    mapping (address => bool) public hasStaked;

    // Current Staking status
    mapping (address => bool) public isStaking;

    constructor(DaiToken _daiToken, DappToken _dappToken) public {
        daiToken = _daiToken;
        dappToken = _dappToken;
        owner = msg.sender;
    }

    // 1- Stake Tokens - Dai --> Deposit
    function stakeTokens(uint _amount) public {
        // Require amount greater then 0
        require(_amount > 0, "ammount cannot be 0");

        // Transfer Mock Dai Tokens to Token Farm (this --> current contract address) for Staking
        // Must approve before transferFrom is called
        daiToken.transferFrom(msg.sender, address(this), _amount); 

        // Add the amount to the staking balance (update it)
        stakingBalance[msg.sender] += _amount;

        // Add users to stakers array (if they are not already there) / only if they haven't staked before
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
            
        }
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    
    }

    // 3- unstake Tokens (withdraw)
    function unstakeTokens() public {
        // fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require amount cannot be greater then 0
        require(balance > 0, 'staking balance cannot be 0');

        // Transer mock Dai tokens back to the investor
        daiToken.transfer(msg.sender, balance);

        // Reset Staking balance
        stakingBalance[msg.sender] = 0;

        //update staking status
        isStaking[msg.sender] = false;

    }

    // 2- Issuin Tokens
    function issueTokens() public {
        // We only want owner to be able to issue tokens
        require(msg.sender == owner, 'Caller must be the owner');

        // We loop through stakers array and reward them/ issue token to them
        for(uint i=0; i<stakers.length; i++) {
            address recepient = stakers[i];
            uint balance = stakingBalance[recepient];
            // we will transfer dapp token equal to the amount of dai they stake
            if(balance > 0){
                dappToken.transfer(recepient, balance);
            }

        }
    }

}
