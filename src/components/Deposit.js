import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropDownButton';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { swap, loadBalances } from '../store/interactions';
import Alert from './Alert';

const Deposit = () => {
	const [token1Amount, setToken1Amount] = useState(0);
	const [token2Amount, setToken2Amount] = useState(0);
	const provider = useSelector((state) => state.provider.connection);
	const account = useSelector((state) => state.provider.account);
	const tokens = useSelector((state) => state.tokens.contracts);
	const symbols = useSelector((state) => state.tokens.symbols);
	const balances = useSelector((state) => state.tokens.balances);

	return (
		<div>
			<Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
				{account ? (
					<Form style={{ maxWidth: '450px', margin: '50px auto' }}>
						<Row>
							<Form.Text className='text-end my-2' muted>
								Balance:{balances[0]}
							</Form.Text>

							{/* Input values */}
							<InputGroup>
								<Form.Control
									type='number'
									placeholder='0.0'
									min='0.0'
									step='any'
									id='token1'
									value={
										token1Amount === 0 ? '' : token1Amount
									}
								></Form.Control>
								<InputGroup.Text
									style={{ width: '100px' }}
									className='justify-content-center'
								>
									{symbols && symbols[0]}
								</InputGroup.Text>
							</InputGroup>
						</Row>
						<Row className='my-3'>
							<Form.Text className='text-end my-2' muted>
								Balance:{balances[1]}
							</Form.Text>

							{/* output values */}
							<InputGroup>
								<Form.Control
									type='number'
									placeholder='0.0'
									step='any'
									id='token2'
									value={
										token2Amount === 0 ? '' : token2Amount
									}
								></Form.Control>
								<InputGroup.Text
									style={{ width: '100px' }}
									className='justify-content-center'
								>
									{symbols && symbols[1]}
								</InputGroup.Text>
							</InputGroup>
						</Row>
						<Row className='my-3'>
							<Button type='submit'>Deposit</Button>
						</Row>
					</Form>
				) : (
					<p
						className='d-flex justify-content-center align-items-center'
						style={{ height: '300px' }}
					>
						Please connect wallet
					</p>
				)}
			</Card>
		</div>
	);
};

export default Deposit;
