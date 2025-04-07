require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.9',
};

// todo
// obtain alchemy rpc url with api key and add to .env
// update this to include sepolia network
// deploy contracts to sepolia
// run seeding scripts on sepolia
// update config.json with contract addresses for sepolia

// links posted by anthony
// https://hardhat.org/tutorial/deploying-to-a-live-network
//
// 0xAA36A7	11155111	Sepolia Testnet
//  https://gist.github.com/melwong/c30eb1e21eda17549996a609c35dafb3
// https://chainlist.org/chain/11155111
