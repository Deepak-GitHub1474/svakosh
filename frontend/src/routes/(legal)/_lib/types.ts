export type TLegalSection = { heading: string; body: string[] };

export type TLegalDoc = {
	title: string;
	eyebrow?: string;
	intro: string;
	sections: TLegalSection[];
};
