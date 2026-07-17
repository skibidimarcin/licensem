import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: Request) {
    const auth = req.headers.get('authorization');
    if (auth !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { days } = body; // -1 to perm
        const key = "LO-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        
        const expiry = days === -1 ? -1 : Date.now() + (days * 24 * 60 * 60 * 1000);
        
        const { error } = await supabase
            .from('licenses')
            .insert([{ key, hwid: null, expiry_date: expiry, created_at: Date.now() }]);

        if (error) {
            return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
        }
        
        return NextResponse.json({ key, expiry });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
