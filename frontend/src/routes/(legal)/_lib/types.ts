export type TLegalSection = { heading: string; body: string[] };

export type TLegalDoc = {
	title: string;
	intro: string;
	sections: TLegalSection[];
};
