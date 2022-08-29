const {ethers, getNamedAccounts} = require("hardhat");

async function main() {
  // const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const {deployer} = await getNamedAccounts()
  console.log(deployer)
  const reciever = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  const feeAccount = "0x3Ca95a06C6d62891F9f758440EC7FB1499F27451"
  const feesPercent = 10
  let tx
  let amount = ethers.utils.parseEther("2000")
  const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
  const ether = (n) => {
    return ethers.utils.parseEther(n.toString(), "ether")
  }
  const token = (n) => ether(n)
  // We get the exchange contract to deploy
   
   const Exchange = await ethers.getContractFactory("Exchange");
   const exchange = await Exchange.deploy(feeAccount, feesPercent);
 
   await exchange.deployed();
 
   console.log("Exchange deployed to:", exchange.address);
   // token
  const Token = await ethers.getContractFactory("Token");
  const tokenContract = await Token.deploy();

  await tokenContract.deployed();

  console.log("Token deployed to:", tokenContract.address);

 

  // interacting with contracts
  await tokenContract.transfer(reciever,amount ,{from: deployer} )
  console.log(`transferred ${amount} to  ${reciever}`)

  // exchange interaction
  const user1 = deployer
  const user2 = reciever

  amount = "1"

  await exchange.depositEther({from: user1, value: ether(amount)})
  
  console.log( `deposited ${amount} from ${user1}`)
  // user 2 approves 
  amount = "500"
  const balance = await tokenContract.balanceOf(user2)
  console.log(`My balance is ${balance}`)
  await tokenContract.approve(exchange.address, token(amount), {from: user1})
  console.log(`exchange at ${exchange.address} has been approved to spend ${amount} from ${user2} address`)
  // deposit token
  await exchange.depositToken(tokenContract.address, token(amount), {from: user1})
  console.log(`the exchange has recieved ${token(amount)} from ${user1}`)

  // user1 makes order
  let orderId
  tx = await exchange.makeOrder(tokenContract.address, ETHER_ADDRESS, token(100), ether(1), { from: user1 })
  console.log(`made order of ${token(100)} from ${user1}`)
  tx.wait(1)

  // // User 1 cancells order
  orderId = 1
  tx = await exchange.cancelOrder(orderId, { from: user1})
  console.log(`Cancelled order from ${user1}`)
  tx.wait(1)

  // User 1 makes order
  result = await exchange.makeOrder(tokenContract.address, ETHER_ADDRESS, token(100),  ether(0.1), { from: user1 })
  console.log(`Made order from ${user1}`)

  // User 2 fills order
  // orderId = 2
  // await exchange.fillOrder(orderId, { from: user2 })
  // console.log(`Filled order from ${user2}`)

  // // Wait 1 second
  // await wait(1)

  // // User 1 makes another order
  // result = await exchange.makeOrder(tokenContract.address,ETHER_ADDRESS, token(50),  ether(0.01), { from: user1 })
  // console.log(`Made order from ${user1}`)

  // // User 2 fills another order
  // orderId = 3
  // await exchange.fillOrder(orderId, { from: exchange.address })
  // console.log(`Filled order from ${exchange.address}`)

  // // Wait 1 second
  // await wait(1)

  // // User 1 makes final order
  // result = await exchange.makeOrder(tokenContract.address, ETHER_ADDRESS, token(200), ether(0.15), { from: user1 })
  // console.log(`Made order from ${user1}`)

  // // User 2 fills final order
  // orderId = 3
  // await exchange.fillOrder(orderId, { from: user2 })
  // console.log(`Filled order from ${user2}`)

  // // Wait 1 second
  // await wait(1)

  // /////////////////////////////////////////////////////////////
  // // Seed Open Orders
  // //

  // // User 1 makes 10 orders
  // for (let i = 1; i <= 10; i++) {
  //   result = await exchange.makeOrder(tokenContract.address, ETHER_ADDRESS,token(10 * i), ether(0.01), { from: user1 })
  //   console.log(`Made order from ${user1}`)
  //   // Wait 1 second
  //   await wait(1)
  // }

  // // User 2 makes 10 orders
  // for (let i = 1; i <= 10; i++) {
  //   result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), tokenContract.address, token(10 * i), { from: user2 })
  //   console.log(`Made order from ${user2}`)
  //   // Wait 1 second
  //   await wait(1)
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
