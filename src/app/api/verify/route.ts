import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { key, hwid } = body;

        if (!key || !hwid) {
            return NextResponse.json({ valid: false, reason: "Missing data" });
        }

        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) {
            return NextResponse.json({ valid: false, reason: "Invalid key" });
        }

        const now = Date.now();
        if (data.expiry_date !== -1 && now > data.expiry_date) {
            return NextResponse.json({ valid: false, reason: "License expired" });
        }

        if (!data.hwid) {
            const { error: updateError } = await supabase
                .from('licenses')
                .update({ hwid: hwid })
                .eq('key', key);

            if (updateError) {
                return NextResponse.json({ valid: false, reason: "Database error" });
            }
            return NextResponse.json({ valid: true, first_activation: true });
        }

        if (data.hwid === hwid) {
            return NextResponse.json({ valid: true });
        }

        return NextResponse.json({ valid: false, reason: "HWID mismatch" });

    } catch (e) {
        return NextResponse.json({ valid: false, reason: "Server error" }, { status: 500 });
    }
}
