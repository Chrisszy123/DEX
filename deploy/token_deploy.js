const {verify} = require("../utils/verify")
const {network } = require("hardhat")
const {developmentNetworks} = require("../hardhat-helper")

module.exports = async function({deployments, getNamedAccounts }) {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    // const args = [name, symbol]

    // deploy
    console.log("deploying ----------")
    const token = await deploy("Token", {
        from: deployer,
        logs: true,
        waitConfirmation: network.config.blockConfirmations || 1
    })
    console.log(`Token contract address ${token.address}`)
    // check if were on dev environment
    if(!developmentNetworks.includes(network.name) && process.env.API_KEY) {
        console.log("verifying contract...")
        await verify(token.address, args);
        console.log("Contract Verified...")
    }
    log("-----------------------------------------------------")
}
module.exports.tags = ["all", "Token"]