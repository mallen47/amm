// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');

async function main() {
	const Token = await hre.ethers.getContractFactory('Token');

	// Deploy Token1
	let dapp = await Token.deploy('Dapp token', 'DAPP', '1000000');
	await dapp.deployed();
	console.log(`Token1 deployed to: ${dapp.address}\n`);

	// Deploy Token2
	const usd = await Token.deploy('USD token', 'USD', '1000000');
	await usd.deployed();
	console.log(`Token2 deployed to: ${usd.address}\n`);

	// Deploy AMM
	const AMM = await hre.ethers.getContractFactory('AMM');
	const amm = await AMM.deploy(dapp.address, usd.address);

	console.log(`AMM contract deployed to: ${amm.address}\n`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
