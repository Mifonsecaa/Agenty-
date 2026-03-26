import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const missingSupabaseEnvError = new Error(
	'Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
);

function createUnavailableSupabaseClient() {
	return new Proxy({} as ReturnType<typeof createClient>, {
		get() {
			throw missingSupabaseEnvError;
		},
	});
}

// Keep imports safe during build/preview and fail only on actual Supabase usage.
export const supabase =
	supabaseUrl && supabaseKey
		? createClient(supabaseUrl, supabaseKey)
		: createUnavailableSupabaseClient();

