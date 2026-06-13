import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Fichier et userId requis' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('cv-photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de l'upload" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from('cv-photos')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
