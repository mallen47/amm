const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether');
};

const ether = tokens;

describe('AMM', () => {
	let accounts, deployer, liquidityProvider;

	let amm, token1, token2;

	beforeEach(async () => {
		// Setup accounts
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		liquidityProvider = accounts[1];

		// Deploy tokens
		const Token = await ethers.getContractFactory('Token');
		token1 = await Token.deploy('Dapp University', 'DAPP', '1000000');
		token2 = await Token.deploy('USD Token', 'USD', '1000000');

		// Send tokens to liquidity provider
		let transaction = await token1
			.connect(deployer)
			.transfer(liquidityProvider.address, tokens(100000));
		await transaction.wait();

		transaction = await token2
			.connect(deployer)
			.transfer(liquidityProvider.address, tokens(100000));
		await transaction.wait();

		// Deploy AMM
		const AMM = await ethers.getContractFactory('AMM');
		amm = await AMM.deploy(token1.address, token2.address);
	});

	describe('Deployment', () => {
		it('has an address', async () => {
			expect(amm.address).to.not.equal(0x0);
		});

		it('tracks token1 address', async () => {
			expect(await amm.token1()).to.equal(token1.address);
		});

		it('tracks token2 address', async () => {
			expect(await amm.token2()).to.equal(token2.address);
		});
	});

	describe('Swapping tokens', async () => {
		let amount, transaction, result;

		it('facilitates swaps', async () => {
			// Deployer approves 100k tokens
			amount = tokens(100000);
			transaction = await token1
				.connect(deployer)
				.approve(amm.address, amount);
			await transaction.wait();

			transaction = await token2
				.connect(deployer)
				.approve(amm.address, amount);
			await transaction.wait();

			// deployer adds liquidity
			transaction = await amm
				.connect(deployer)
				.addLiquidity(amount, amount);
			await transaction.wait();

			// Check AMM receives tokens
			expect(await token1.balanceOf(amm.address)).to.equal(amount);
			expect(await token2.balanceOf(amm.address)).to.equal(amount);

			expect(await amm.token1Balance()).to.equal(amount);
			expect(await amm.token2Balance()).to.equal(amount);

			// Check deployer has 100 shares
			expect(await amm.shares(deployer.address)).to.equal(tokens(100));

			// Check pool has 100 shares
			expect(await amm.totalShares()).to.equal(tokens(100));

			// LP adds more liquidity
			// approves 50k tokens
			amount = tokens(50000);
			transaction = await token1
				.connect(liquidityProvider)
				.approve(amm.address, amount);
			await transaction.wait();

			transaction = await token2
				.connect(liquidityProvider)
				.approve(amm.address, amount);
			await transaction.wait();

			// calculate token2 deposit amount
			let token2Deposit = await amm.calculateToken2Deposit(amount);

			// LP adds DAPP and USD tokens
			transaction = await amm
				.connect(liquidityProvider)
				.addLiquidity(amount, token2Deposit);
			await transaction.wait();

			// LP should have 50 shares
			expect(await amm.shares(liquidityProvider.address)).to.be.equal(
				tokens(50)
			);

			// Deployer should still have 100 shares
			expect(await amm.shares(deployer.address)).to.be.equal(tokens(100));

			// Pool should now have 150 shares
			expect(await amm.totalShares()).to.be.equal(tokens(150));
		});
	});
});
