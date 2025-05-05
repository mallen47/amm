export const options = {
	chart: {
		height: 350,
		type: 'line',
		zoom: {
			enabled: false,
		},
	},
	dataLabels: {
		enabled: false,
	},
	stroke: {
		curve: 'straight',
	},
	title: {
		text: 'Reserve History',
		align: 'left',
	},
	grid: {
		row: {
			colors: ['#f3f3f3', 'transparent'],
			opacity: 0.5,
		},
	},
};

export const series = [
	{
		data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
	},
];
