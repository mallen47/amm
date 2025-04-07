import { ethers } from 'ethers';
import { setAccount, setProvider, setNetwork } from './reducers/provider';
import { setContracts, setSymbols, balancesLoaded } from './reducers/tokens';
import { setContract, sharesLoaded } from './reducers/amm';
import TOKEN_ABI from '../abis/Token.json';
import AMM_ABI from '../abis/AMM.json';
import config from '../config.json';

export const loadProvider = (dispatch) => {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	dispatch(setProvider(provider));

	return provider;
};

export const loadNetwork = async (dispatch, provider) => {
	const { chainId } = await provider.getNetwork();
	console.log(`chainId ==> ${chainId}`);
	dispatch(setNetwork(chainId));

	return chainId;
};

export const loadAccount = async (dispatch) => {
	const accounts = await window.ethereum.request({
		method: 'eth_requestAccounts',
	});
	const account = ethers.utils.getAddress(accounts[0]);
	dispatch(setAccount(account));

	return account;
};

// -------------------------------
// LOAD CONTRACTS
// -------------------------------

export const loadTokens = async (provider, chainId, dispatch) => {
	const networkConfig = config[String(chainId)];

	if (!networkConfig) {
		console.error(`No config found for chain ID ${chainId}`);
		return;
	}

	const dapp = new ethers.Contract(
		networkConfig.dapp.address,
		TOKEN_ABI,
		provider
	);

	const usd = new ethers.Contract(
		networkConfig.usd.address,
		TOKEN_ABI,
		provider
	);

	dispatch(setContracts([dapp, usd]));
	dispatch(setSymbols([await dapp.symbol(), await usd.symbol()]));
};

export const loadAMM = async (provider, chainId, dispatch) => {
	// const networkConfig = config[chainId];

	// if (!networkConfig) {
	// 	console.error(`No config found for chain ID ${chainId}`);
	// 	return;
	// }

	const amm = new ethers.Contract(
		config[chainId].amm.address,
		AMM_ABI,
		provider
	);
	console.log(`amm ===> ${amm}`);
	dispatch(setContract(amm));

	return amm;
};

// --------------------------------------
// LOAD BALANCES & SHARES
// --------------------------------------

export const loadBalances = async (amm, tokens, account, dispatch) => {
	const balance1 = await tokens[0].balanceOf(account);
	const balance2 = await tokens[1].balanceOf(account);
	const formattedBalance1 = ethers.utils.formatUnits(
		balance1.toString(),
		'ether'
	);
	const formattedBalance2 = ethers.utils.formatUnits(
		balance2.toString(),
		'ether'
	);

	dispatch(balancesLoaded([formattedBalance1, formattedBalance2]));
	console.log(`about to read shares...`);
	const shares = await amm.shares(account);
	console.log(`shares ==> ${shares}`);
	dispatch(
		sharesLoaded(ethers.utils.formatUnits(shares.toString(), 'ether'))
	);
};
