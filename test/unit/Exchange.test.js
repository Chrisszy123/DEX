const {expect} = require("chai")
const { ethers } = require("hardhat")


describe("Exchange", async function(){
    const feePercent = 10
    const gasPrice = ether(0.00206736)
    const transferAmount = 100
    let token, exchange, deployer, feeAccount, user1, user2, rebalancer

    beforeEach(async function() {
        accounts = await ethers.getSigners()
        deployer = accounts[0] // deployer is the first account in the array of accounts
        feeAccount = accounts[1]
        user1 = accounts[2]
        // deploy token contract
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy()
        console.log(token)
        // transfer tokens  to user1
        token.transfer(user1, transferAmount, {from: deployer})
        // deploy the exchange smart contract
        const Exchange = await ethers.getContractFactory("Exchange")
        exchange = await Exchange.deploy(feeAccount, feePercent)  // passing the constructor arguments on deploy
        console.log(exchange)
    })
    describe("deployment", async function() {
        it("it should track the feeAccount", async function(){
            const result = await exchange.feesAccount()
            result.should.equal(feeAccount)
        })
        it("it should tract the feePercent", async function(){
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })
    })
    
})