import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import logo from '../logo.png';
import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies';
import { loadAccount, loadBalances } from '../store/interactions';

const Navigation = () => {
	const account = useSelector((state) => state.provider.account);
	const tokens = useSelector((state) => state.tokens.contracts);
	const dispatch = useDispatch();

	const connectHandler = async () => {
		const account = await loadAccount(dispatch);
		await loadBalances(tokens, account, dispatch);
	};

	return (
		<Navbar className='my-3'>
			<img
				alt='logo'
				src={logo}
				width='40'
				height='40'
				className='d-inline-block align-top mx-3'
			/>
			<Navbar.Brand href='#'>Dapp University Template</Navbar.Brand>
			<Navbar.Collapse className='justify-content-end'>
				{account ? (
					<Navbar.Text>
						{account.slice(0, 5) + '...' + account.slice(38, 42)}
						<Blockies
							seed={account}
							size={10}
							scale={3}
							color='#2187D0'
							bgColor='#F1F2F9'
							spotcolor='#767F92'
							className='identicon mx-2'
						></Blockies>
					</Navbar.Text>
				) : (
					<Button onClick={connectHandler}>Connect</Button>
				)}
			</Navbar.Collapse>
		</Navbar>
	);
};

export default Navigation;
