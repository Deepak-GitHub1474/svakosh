export type TAddress = {
	city?: string | null;
	state?: string | null;
	country?: string | null;
	pincode?: string | null;
};

export type TProfileDetails = {
	full_name?: string | null;
	username?: string | null;
	avatar?: string | null;
	gender?: string | null;
	dob?: string | null;
	occupation?: string | null;
	pan_number?: string | null;
	whatsapp_number?: string | null;
	whatsapp_number_verified?: boolean;
	address?: TAddress | null;
};

export type TProfile = {
	email?: string | null;
	mobile_number?: string | null;
	status?: string | null;
	role?: string | null;
	referral_code?: string | null;
	referred_by?: string | null;
	created_at?: string | null;
	profile?: TProfileDetails | null;
} | null;

export interface Props {
	data: { profile: TProfile };
}
