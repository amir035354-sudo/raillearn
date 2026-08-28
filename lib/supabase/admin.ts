import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function getSupabaseAdminClient() {
    if (cachedClient) return cachedClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }

    if (!serviceRoleKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    cachedClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return cachedClient;
}

// Keep the existing supabaseAdmin API while delaying env validation until a request runs.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, property) {
        const client = getSupabaseAdminClient();
        const value = Reflect.get(client, property);
        return typeof value === "function" ? value.bind(client) : value;
    },
});
