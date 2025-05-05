import { createSelector } from 'reselect';

const tokens = (state) => state.tokens.contracts;
const swaps = (state) => state.amm.swaps;

export const chartSelector = createSelector(swaps, tokens, (swaps, tokens) => {
	console.log(swaps, tokens);
});
