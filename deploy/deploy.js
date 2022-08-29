const {verify} = require("../utils/verify")
const {network } = require("hardhat")
const {developmentNetworks, feeAccount, feePercent} = require("../hardhat-helper")

module.exports = async function({deployments, getNamedAccounts }) {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const args = [feeAccount, feePercent]

    // deploy
    console.log("deploying ----------")
    const exchange = await deploy("Exchange", {
        from: deployer,
        logs: true,
        args: args,
        waitConfirmation: network.config.blockConfirmations || 1
    })
    console.log(`Exchange contract address ${exchange.address}`)
    // check if were on dev environment
    if(!developmentNetworks.includes(network.name) && process.env.API_KEY) {
        console.log("verifying exchange contract...")
        await verify(exchange.address, args);
        console.log("Contract Verified...")
    }
    log("-----------------------------------------------------")
}
module.exports.tags = ["all", "Exchange"]