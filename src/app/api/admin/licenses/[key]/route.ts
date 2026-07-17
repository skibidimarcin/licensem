import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function DELETE(req: Request, { params }: { params: Promise<{ key: string }> }) {
    const auth = req.headers.get('authorization');
    if (auth !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { key } = await params;
        const { error } = await supabase
            .from('licenses')
            .delete()
            .eq('key', key);

        if (error) {
            return NextResponse.json({ error: "DB Error" }, { status: 500 });
        }
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ key: string }> }) {
    const auth = req.headers.get('authorization');
    if (auth !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { key } = await params;
        const { error } = await supabase
            .from('licenses')
            .update({ hwid: null })
            .eq('key', key);

        if (error) {
            return NextResponse.json({ error: "DB Error" }, { status: 500 });
        }
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
