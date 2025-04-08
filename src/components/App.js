import { useDispatch } from 'react-redux';
import { Container } from 'react-bootstrap';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './Navigation';
import Swap from './Swap';
import Deposit from './Deposit';
import Charts from './Charts';
import Withdraw from './Withdraw';
import Tabs from './Tabs';

import {
	loadAccount,
	loadProvider,
	loadNetwork,
	loadTokens,
	loadAMM,
} from '../store/interactions';
import { useEffect } from 'react';

function App() {
	const dispatch = useDispatch();

	const loadBlockchainData = async () => {
		// Initiate provider
		const provider = loadProvider(dispatch);

		// Fetch current netowrk's chainId (e.g. hardhat: 31337, kovan: 42)
		const chainId = await loadNetwork(dispatch, provider);

		// Reload page when network changes
		window.ethereum.on('chainChanged', () => {
			window.location.reload();
		});

		// Fetch current account from Metamask when changed
		window.ethereum.on('accountsChanged', async () => {
			await loadAccount(dispatch);
		});

		// Initiate contracts
		await loadTokens(provider, chainId, dispatch);
		await loadAMM(provider, chainId, dispatch);
	};

	useEffect(() => {
		loadBlockchainData();
	});

	return (
		<Container>
			<HashRouter>
				<Navigation />
				<hr />
				<Tabs />
				<Routes>
					<Route exact path='/' element={<Swap />} />
					<Route path='/deposit' element={<Deposit />} />
					<Route path='/withdraw' element={<Withdraw />} />
					<Route path='/charts' element={<Charts />} />
				</Routes>
			</HashRouter>
		</Container>
	);
}

export default App;
