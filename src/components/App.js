import { useDispatch } from 'react-redux';
import { Container } from 'react-bootstrap';

// Components
import Navigation from './Navigation';
import { loadAccount, loadProvider, loadNetwork } from '../store/interactions';
import { useEffect } from 'react';

// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
// import config from '../config.json';

function App() {
	const dispatch = useDispatch();

	const loadBlockchainData = async () => {
		// Initiate provider
		const provider = loadProvider(dispatch);

		const chainId = await loadNetwork(dispatch, provider);

		// Fetch accounts
		await loadAccount(dispatch);
	};

	useEffect(() => {
		loadBlockchainData();
	}, []);

	return (
		<Container>
			<Navigation account={'0x0...'} />

			<h1 className='my-4 text-center'>React Hardhat Template</h1>
			<>
				<p className='text-center'>
					<strong>Your ETH Balance:</strong> {0} ETH
				</p>
				<p className='text-center'>
					Edit App.js to add your code here.
				</p>
			</>
		</Container>
	);
}

export default App;
