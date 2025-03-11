const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether');
};

const ether = tokens;

describe('AMM', () => {
	let accounts, deployer, liquidityProvider, investor1, investor2;

	let amm, token1, token2;

	beforeEach(async () => {
		// Setup accounts
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		liquidityProvider = accounts[1];
		investor1 = accounts[2];
		investor2 = accounts[3];

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

		// send token1 tokens to investor1
		transaction = await token1
			.connect(deployer)
			.transfer(investor1.address, tokens(100000));
		await transaction.wait();

		// send token2 tokens to investor2
		transaction = await token2
			.connect(deployer)
			.transfer(investor2.address, tokens(100000));
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
		let amount, transaction, result, balance, estimate;

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

			///////////////////////////////
			// LP adds more liquidity
			///////////////////////////////

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

			///////////////////////////////
			// Investor 1 swaps
			///////////////////////////////

			// check prices before swapping
			console.log(
				`Price before swapping: ${
					(await amm.token2Balance()) / (await amm.token1Balance())
				}\n`
			);

			// Investor 1 swaps all tokens
			transaction = await token1
				.connect(investor1)
				.approve(amm.address, tokens(100000));
			await transaction.wait();

			// Check investor1 balance before swap
			balance = await token2.balanceOf(investor1.address);
			console.log(
				`Investor1 token2 balance before swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);

			// Estimate amount of tokens investor1 will receive after swapping token1, including slippage
			estimate = await amm.calculateToken1Swap(tokens(1));
			console.log(
				`Token2 amount investor1 will receive after swap: ${ethers.utils.formatEther(
					estimate
				)}\n`
			);

			// Investor1 swaps 1 token1
			transaction = await amm.connect(investor1).swapToken1(tokens(1));
			await transaction.wait();

			// check swap event
			let block = await ethers.provider.getBlock('latest');
			let timestamp = block.timestamp;

			await expect(transaction)
				.to.emit(amm, 'Swap')
				.withArgs(
					investor1.address,
					token1.address,
					tokens(1),
					token2.address,
					estimate,
					await amm.token1Balance(),
					await amm.token2Balance(),
					timestamp
				);

			// Check investor1 balance after swap to confirm balance matches estimate
			balance = await token2.balanceOf(investor1.address);
			console.log(
				`Investor1 Token2 balance after swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);
			expect(balance).to.equal(estimate);

			// Check AMM token balances are in sync
			expect(await token1.balanceOf(amm.address)).to.be.equal(
				await amm.token1Balance()
			);
			expect(await token2.balanceOf(amm.address)).to.be.equal(
				await amm.token2Balance()
			);

			// check prices after swapping
			console.log(
				`Price after swapping: ${
					(await amm.token2Balance()) / (await amm.token1Balance())
				}\n`
			);

			//////////////////////////////////
			// Investor 1 does another swap
			//////////////////////////////////

			// See how swapping more tokens affects price...
			balance = await token2.balanceOf(investor1.address);
			console.log(
				`Investor1 token2 balance before swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);

			// Estimate amount of tokens investor1 will receive after swapping token1, including slippage
			estimate = await amm.calculateToken1Swap(tokens(1));
			console.log(
				`Token2 amount investor1 will receive after swap: ${ethers.utils.formatEther(
					estimate
				)}\n`
			);

			// Investor1 swaps 1 token1
			transaction = await amm.connect(investor1).swapToken1(tokens(1));
			await transaction.wait();

			// Check investor1 balance after swap
			balance = await token2.balanceOf(investor1.address);
			console.log(
				`Investor1 Token2 balance after swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);

			// Check AMM token balances are in sync
			expect(await token1.balanceOf(amm.address)).to.be.equal(
				await amm.token1Balance()
			);
			expect(await token2.balanceOf(amm.address)).to.be.equal(
				await amm.token2Balance()
			);

			// check prices after swapping
			console.log(
				`Price after swapping: ${
					(await amm.token2Balance()) / (await amm.token1Balance())
				}\n`
			);

			////////////////////////////////////
			// Investor 1 swaps a large amount
			////////////////////////////////////

			// See how swapping large amount of tokens affects price...
			balance = await token2.balanceOf(investor1.address);
			console.log(
				`Investor1 token2 balance before swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);

			// Estimate amount of tokens investor1 will receive after swapping token1, including slippage
			estimate = await amm.calculateToken1Swap(tokens(10000));
			console.log(
				`Token2 amount investor1 will receive after swap: ${ethers.utils.formatEther(
					estimate
				)}\n`
			);

			// Investor1 swaps 1 token1
			transaction = await amm
				.connect(investor1)
				.swapToken1(tokens(10000));
			await transaction.wait();

			// Check investor1 balance after swap
			balance = await token2.balanceOf(investor1.address);
			console.log(
				`Investor1 Token2 balance after swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);

			// Check AMM token balances are in sync
			expect(await token1.balanceOf(amm.address)).to.be.equal(
				await amm.token1Balance()
			);
			expect(await token2.balanceOf(amm.address)).to.be.equal(
				await amm.token2Balance()
			);

			// check prices after swapping
			console.log(
				`Price after swapping: ${
					(await amm.token2Balance()) / (await amm.token1Balance())
				}\n`
			);

			///////////////////////
			// Investor 2 swaps
			//////////////////////

			// Investor2 approves all tokens
			transaction = await token2
				.connect(investor2)
				.approve(amm.address, tokens(100000));
			await transaction.wait();

			// Check investor2 balance before swap
			balance = await token1.balanceOf(investor2.address);

			console.log(
				`Investor2 token1 balance before swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);

			// Estimate amount of tokens investor2 will receive after swapping token2: includes slippage
			estimate = await amm.calculateToken2Swap(tokens(1));
			console.log(
				`Token1 amount investor2 will receive after swap: ${ethers.utils.formatEther(
					estimate
				)}\n`
			);

			// // Investor2 swaps 1 token
			transaction = await amm.connect(investor2).swapToken2(tokens(1));
			await transaction.wait();

			// // check swap event
			block = await ethers.provider.getBlock('latest');
			timestamp = block.timestamp;

			await expect(transaction)
				.to.emit(amm, 'Swap')
				.withArgs(
					investor2.address,
					token2.address,
					tokens(1),
					token1.address,
					estimate,
					await amm.token1Balance(),
					await amm.token2Balance(),
					timestamp
				);

			// check investor2 balance after swap
			balance = await token1.balanceOf(investor2.address);
			console.log(
				`Investor2 Token1 balance after swap: ${ethers.utils.formatEther(
					balance
				)}\n`
			);
			expect(estimate).to.equal(balance);
		});

		// Check AMM token balances are in sync
		expect(await token1.balanceOf(amm.address)).to.be.equal(
			await amm.token1Balance()
		);
		expect(await token2.balanceOf(amm.address)).to.be.equal(
			await amm.token2Balance()
		);

		// check prices after swapping
		console.log(
			`Price after swapping: ${
				(await amm.token1Balance()) / (await amm.token2Balance())
			}\n`
		);
	});
});
