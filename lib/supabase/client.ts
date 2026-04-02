import { createClient } from "@supabase/supabase-js";

/**
 * ブラウザ（クライアントコンポーネント）から Supabase に接続するためのクライアント。
 * URL と anon（公開）キーは .env.local の NEXT_PUBLIC_* から読み込む。
 *
 * ※ service_role（秘密キー）はブラウザに絶対に渡さないこと。
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// 参照用（URLのみ。キーや秘密情報は公開しない）
export const supabaseUrl = url;

function isValidHttpUrl(value: string | undefined): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

// .env.local の値が壊れていても、アプリが「初期評価の段階」で落ちないようにする
export const supabase = (() => {
  if (!isValidHttpUrl(url) || !anonKey) return null;
  try {
    // ここまで到達しているときは url/anonKey が string のはず
    return createClient(url as string, anonKey as string);
  } catch {
    return null;
  }
})();

export function isSupabaseConfigured(): boolean {
  return Boolean(isValidHttpUrl(url) && anonKey);
}
