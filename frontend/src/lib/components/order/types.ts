export type TOrderTicket = {
	token: string;
	transaction: 'BUY' | 'SELL';
	orderType: 'Market' | 'Limit';
	product: 'MIS' | 'NRML' | 'CNC';
	lots: number;
	price: number;
	lotSize: number;
};
