export type TIconType = 'mail' | 'lock' | 'user';

export	type TIllustrationPanel = {
	image: string;
	alt: string;
	caption: string;
	index: number;
	class?: string;
};

export type TOtpErrorData = {
	code?: string;
	message?: string;
	is_new_user?: boolean;
	is_blocked?: boolean;
	attempts_used?: number;
	attempts_remaining?: number;
	retry_after_seconds?: number | null;
	locked?: boolean;
} | null;


export type TIdentifierForm = {
    action: string;
    label: string;
    placeholder: string;
    iconType: TIconType;
    inputId: string;
    ctaLabel: string;
    redirectTo: string;
    message?: string;
    autocomplete?: HTMLInputElement['autocomplete'];
};


export	type TOtpVerifyingForm = {
		verifyAction: string;
		resendAction: string;
		identifier: string;
		redirectTo: string;
		ctaLabel: string;
		changeLabel: string;
		message?: string;
		error?: TOtpErrorData;
		onChange: () => void;
	};