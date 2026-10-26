import { BUSINESS } from '$lib/brand';
import { ICONS } from '$lib/components/landing/data';
import type { TLegalDoc } from './types';

const contact = `${BUSINESS.email} or ${BUSINESS.phone}`;

export const TERMS: TLegalDoc = {
	title: 'Terms & Conditions',
	intro: `These terms govern your use of SvaKosh, a software service operated by ${BUSINESS.legalName}. By creating an account or using the service you agree to them.`,
	sections: [
		{
			heading: 'The service',
			body: [
				'SvaKosh is subscription software that shows market data views and analytics for Indian indices, stocks and derivatives, such as option chains, open interest charts, screeners and related tools.',
				'If you link your own broker account, SvaKosh lets you send orders to that broker and view your positions, holdings and funds. Orders are placed only on your instruction, through your broker, under your broker account.'
			]
		},
		{
			heading: 'No investment advice',
			body: [
				'SvaKosh does not provide investment advice, research reports, recommendations, tips or signals, and is not registered with SEBI as an investment adviser or research analyst. Everything shown is for information only.',
				'All trading and investment decisions are yours. Trading in securities and derivatives carries risk, including loss of capital.'
			]
		},
		{
			heading: 'Accounts',
			body: [
				'You must be at least 18 years old and provide accurate details. You are responsible for activity on your account and for keeping your sign-in methods secure.',
				'We may suspend or close accounts that misuse the service, attempt to access other users’ data, or break these terms.'
			]
		},
		{
			heading: 'Subscriptions and billing',
			body: [
				'Some features need a paid subscription. Prices are shown in INR on the pricing page before you pay. Payments are processed by our payment partner; we do not store your card or bank details.',
				'Subscriptions renew automatically at the end of each period until you cancel autopay. Access lasts until 11:59 PM IST on the last day of the paid period.',
				'Refunds and cancellations follow our Refund & Cancellation Policy.'
			]
		},
		{
			heading: 'Broker connections',
			body: [
				'Linking a broker account requires credentials or API keys issued by your broker. They are stored encrypted and used only to act on your instructions.',
				'Your relationship with your broker is governed by your broker’s terms. SvaKosh is not a stock broker and does not hold your funds or securities. Brokers may reject, delay or modify orders, and we are not responsible for their systems or outages.'
			]
		},
		{
			heading: 'Market data',
			body: [
				'Market data may be delayed, incomplete or inaccurate, and the service may be unavailable at times. Always confirm prices and order status with your broker before acting.'
			]
		},
		{
			heading: 'Acceptable use',
			body: [
				'Do not copy, resell, scrape or redistribute the service or its data, interfere with its operation, or use it for any unlawful purpose.'
			]
		},
		{
			heading: 'Intellectual property',
			body: [
				'The SvaKosh name, software and design belong to us. Your subscription gives you a personal, non-transferable right to use the service while it is active.'
			]
		},
		{
			heading: 'Limitation of liability',
			body: [
				'The service is provided as is. To the extent allowed by law, we are not liable for trading losses, missed opportunities, or indirect damages arising from use of the service. Our total liability is limited to the amount you paid us in the three months before the claim.'
			]
		},
		{
			heading: 'Changes and termination',
			body: [
				'We may update these terms or the service. Material changes will be notified in the app or by email. You may stop using the service and cancel your subscription at any time.'
			]
		},
		{
			heading: 'Governing law',
			body: [
				`These terms are governed by the laws of India, and courts in ${BUSINESS.city} have exclusive jurisdiction.`
			]
		},
		{
			heading: 'Contact',
			body: [`Questions about these terms: ${contact}.`]
		}
	]
};

export const PRIVACY: TLegalDoc = {
	title: 'Privacy Policy',
	intro: `This policy explains what personal data SvaKosh collects, why, and how it is protected. It is operated by ${BUSINESS.legalName} and follows the Digital Personal Data Protection Act, 2023.`,
	sections: [
		{
			heading: 'What we collect',
			body: [
				'Account details: email address, mobile number, name and the profile details you choose to add.',
				'Broker connections: the broker credentials or API keys you provide to link an account, stored encrypted.',
				'Usage and technical data: sign-in times, device and browser type, IP address and app activity needed to run and secure the service.',
				'Billing records: plan, amounts, dates and payment references. Card, UPI and bank details are handled by our payment partner and never reach our servers.'
			]
		},
		{
			heading: 'Why we use it',
			body: [
				'To provide the service, keep your account secure, process subscriptions, send orders to your broker when you ask, respond to support requests and meet legal obligations.'
			]
		},
		{
			heading: 'Sharing',
			body: [
				'We do not sell your data. We share it only with service providers that run SvaKosh for us, such as hosting and our payment partner, with your broker when you place an order, or when required by law.'
			]
		},
		{
			heading: 'Cookies',
			body: [
				'We use essential cookies to keep you signed in and protect against misuse. We do not use advertising cookies.'
			]
		},
		{
			heading: 'Security and retention',
			body: [
				'Data is encrypted in transit, and sensitive credentials are encrypted at rest. We keep data while your account is active and as long as needed for legal, tax and dispute purposes afterwards.'
			]
		},
		{
			heading: 'Your rights',
			body: [
				`You can access, correct or delete your personal data, unlink broker accounts, or withdraw consent by contacting ${BUSINESS.email}. Some records, such as billing history, may be retained where the law requires.`
			]
		},
		{
			heading: 'Grievances',
			body: [
				`For privacy concerns or grievances, write to ${BUSINESS.email}. We acknowledge within 48 hours and aim to resolve within 30 days.`
			]
		}
	]
};

export const REFUNDS: TLegalDoc = {
	title: 'Refund & Cancellation Policy',
	intro: 'How subscription renewals, cancellations and refunds work on SvaKosh.',
	sections: [
		{
			heading: 'Free first month',
			body: [
				'Premium Analytics and a broker account each come with one free first month per user. You authorise autopay at the start; the first charge happens when the free month ends. Cancel autopay before then and you will not be charged.'
			]
		},
		{
			heading: 'Renewals',
			body: [
				'Paid plans renew automatically at the end of each billing period through autopay, at the plan price shown when you subscribed unless we notify you of a change in advance.'
			]
		},
		{
			heading: 'Cancelling',
			body: [
				'You can cancel autopay at any time from Subscription in your account. No further charges are made after cancelling, and you keep access until 11:59 PM IST on the last day of the period you have already paid for.'
			]
		},
		{
			heading: 'Refunds',
			body: [
				'Payments for a billing period that has started are not refundable, including for unused days, because access to the software is provided immediately.',
				'If you were charged twice, charged after cancelling, or charged for a failed activation, contact us within 7 days of the charge and we will refund the full amount.'
			]
		},
		{
			heading: 'Refund timelines',
			body: [
				'Approved refunds are issued to the original payment method within 5–7 working days. Your bank may take a few additional days to show the credit.'
			]
		},
		{
			heading: 'Contact',
			body: [`For billing questions or refund requests: ${contact}.`]
		}
	]
};

export const CONTACT = {
	intro: 'Questions about your account, billing, a refund or a broker connection? Reach us here.',
	response: 'We reply to every message within one working day.',
	items: [
		{ label: 'Email', value: BUSINESS.email, kind: 'email', icon: ICONS.bookmark },
		{ label: 'Phone', value: BUSINESS.phone, kind: 'phone', icon: ICONS.phone },
		{ label: 'Address', value: BUSINESS.address, kind: 'text', icon: ICONS.layers },
		{ label: 'Support hours', value: BUSINESS.hours, kind: 'text', icon: ICONS.clock }
	]
};
