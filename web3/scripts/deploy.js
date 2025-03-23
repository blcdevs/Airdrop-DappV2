const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Token first
  const Token = await ethers.getContractFactory("Tinseltoken");
  const token = await Token.deploy();
  await token.deployed();

  const totalSupply = await token.totalSupplyInReadableFormat();
  console.log("Token deployed to:", token.address);
  console.log("Total supply:", totalSupply.toString(), "TNTC");

  // Get current timestamp and set airdrop duration
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const oneMonthInSeconds = 30 * 24 * 60 * 60;
  const startTime = currentTimestamp;
  const endTime = currentTimestamp + oneMonthInSeconds;

  // Deploy Airdrop Contract
  const TokenAirdrop = await ethers.getContractFactory(
    "TNTCAirdrop"
  );
  const airdrop = await TokenAirdrop.deploy(
    token.address,
    startTime,
    endTime,
    "Tinseltoken Airdrop",
    "First community airdrop with referral program"
  );
  await airdrop.deployed();
  console.log("Airdrop contract deployed to:", airdrop.address);

  // Transfer tokens to the airdrop contract
  const airdropAmount = ethers.utils.parseEther("140000000"); // 140 million tokens
  await token.transfer(airdrop.address, airdropAmount);
  console.log(
    "Transferred",
    ethers.utils.formatEther(airdropAmount),
    "tokens to airdrop contract"
  );

  // Save deployment addresses
  const fs = require("fs");
  const deployments = {
    token: token.address,
    airdrop: airdrop.address,
    network: network.name,
    timestamp: currentTimestamp,
  };

  fs.writeFileSync(
    `deployments-${network.name}.json`,
    JSON.stringify(deployments, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
