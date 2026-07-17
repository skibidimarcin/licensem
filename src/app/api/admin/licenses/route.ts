import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function GET(req: Request) {
    const auth = req.headers.get('authorization');
    if (auth !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: "DB Error" }, { status: 500 });
        }
        
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
