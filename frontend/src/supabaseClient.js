import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your_supabase_url')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadImageToSupabase = async (fileOrBase64) => {
  try {
    if (!fileOrBase64) return null;
    if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://'))) {
      return fileOrBase64;
    }

    let fileBody = fileOrBase64;
    const ext = fileOrBase64.includes('png') ? 'png' : 'jpg';
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:image/')) {
      const res = await fetch(fileOrBase64);
      fileBody = await res.blob();
    }

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, fileBody, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase Storage Bucket upload note:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('Storage upload exception:', err);
    return null;
  }
};
