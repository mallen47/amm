import { ethers } from 'ethers';
import { setAccount, setProvider, setNetwork } from './reducers/provider';

export const loadProvider = (dispatch) => {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	dispatch(setProvider(provider));

	return provider;
};

export const loadNetwork = async (dispatch, provider) => {
	const { chainId } = await provider.getNetwork();
	dispatch(setNetwork(chainId));
};

export const loadAccount = async (dispatch) => {
	const accounts = await window.ethereum.request({
		method: 'eth_requestAccounts',
	});
	const account = ethers.utils.getAddress(accounts[0]);
	dispatch(setAccount(account));

	return account;
};
