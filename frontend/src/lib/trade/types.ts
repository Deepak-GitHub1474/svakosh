export type TSide = 'BUY' | 'SELL';
export type TProduct = 'MIS' | 'CNC' | 'NRML';
export type TOrderKind = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
export type TOrderStatus =
	| 'PENDING'
	| 'UNKNOWN'
	| 'FAILED'
	| 'OPEN'
	| 'TRIGGER_PENDING'
	| 'COMPLETE'
	| 'CANCELLED'
	| 'REJECTED';

export type TBrokerAccount = {
	id: string;
	broker: string;
	client_id: string;
	account_tag: string;
	logged_in: boolean;
	created_at: string;
};

export type TPosition = {
	token?: string;
	exchange: string;
	symbol: string;
	product: TProduct;
	quantity: number;
	buy_quantity: number;
	sell_quantity: number;
	buy_price: number;
	sell_price: number;
	average_price: number;
	last_price: number;
	realised: number;
	unrealised: number;
};

export type THolding = {
	token?: string;
	exchange: string;
	symbol: string;
	isin: string;
	quantity: number;
	t1_quantity: number;
	average_price: number;
	last_price: number;
	close_price: number;
	pnl: number;
};

export type TFunds = { available: number; used: number; total: number };

export type TBrokerOrder = {
	order_id: string;
	token?: string;
	exchange: string;
	symbol: string;
	side: TSide;
	product: TProduct;
	type: TOrderKind;
	quantity: number;
	filled_quantity: number;
	price: number;
	trigger_price: number;
	average_price: number;
	status: TOrderStatus;
	message?: string;
	updated_at: string;
};

export type TOrderRecord = {
	id: string;
	account_id: string;
	client_order_id: string;
	order_id?: string;
	token: string;
	side: TSide;
	product: TProduct;
	type: TOrderKind;
	quantity: number;
	price: number;
	trigger_price: number;
	status: TOrderStatus;
	filled_quantity: number;
	average_price: number;
	message?: string;
	created_at: string;
	updated_at: string;
};

export type TTicket = {
	account_id?: string;
	token: string;
	side: TSide;
	product: TProduct;
	type: TOrderKind;
	quantity: number;
	price: number;
	trigger_price: number;
};

export type TPlaceOrder = TTicket & { client_order_id: string };

export type TLinkAccount = {
	broker: string;
	account_tag: string;
	credentials: Record<string, string>;
};

export type TUpdateAccount = {
	account_tag?: string;
	credentials?: Record<string, string>;
};
