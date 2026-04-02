'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchEntries = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    const { data, error } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false });
    if (!error && data) setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // 🛠️ 自分の最新の投稿のインデックスを探す
  const myLastIndex = entries.findIndex(e => e.author === author);

  const handlePost = async () => {
    if (!content || !author) return;
    setLoading(true);
    const { error } = await supabase.from('diary_entries').insert([{ content, author }]);
    if (!error) { setContent(''); fetchEntries(); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('データを完全消去します。よろしいですか？')) return;
    await supabase.from('diary_entries').delete().eq('id', id);
    fetchEntries();
  };

  return (
    <main className="min-h-screen bg-[#FFD700] p-4 md:p-8 text-black font-sans pb-20">
      <div className="max-w-md mx-auto">
        
        {/* タイトル */}
        <div className="mb-8 shadow-xl relative">
          <h1 className="text-3xl font-black text-center text-red-600 bg-white py-3 rounded-t-2xl border-x-4 border-t-4 border-red-600">四谷学院 静岡校</h1>
          <p className="text-xl font-bold text-center text-white bg-red-600 py-2 rounded-b-2xl border-x-4 border-b-4 border-red-600 tracking-widest">黄色い監獄 📔</p>
        </div>
        
        {/* 入力エリア */}
        <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 border-[6px] border-red-600">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['るー', 'おんに', 'はなを', 'ゆきな', 'あおば', 'ねき'].map((name) => (
              <button key={name} onClick={() => setAuthor(name)} className={author === name ? "py-3 rounded-full font-black border-4 bg-red-600 text-white border-red-600 scale-105" : "py-3 rounded-full font-black border-4 bg-white text-red-600 border-red-600"}>
                {name}
              </button>
            ))}
          </div>
          {author && (
            <div className="animate-in fade-in duration-500">
              <textarea className="w-full p-4 border-4 border-gray-100 rounded-2xl mb-4 bg-gray-50 text-black font-bold outline-none" rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="今の気持ちを入力..." />
              <button onClick={handlePost} disabled={loading} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#991b1b] active:shadow-none active:translate-y-1 text-xl">{loading ? "送信中..." : "日記を投函する ✉️"}</button>
            </div>
          )}
        </div>

        {/* タイムライン */}
        <div className="space-y-6">
          {(author || isDevMode) ? (
            <>
              <h2 className="font-black text-lg text-red-600 bg-white px-4 py-1 rounded-full shadow mb-2 inline-block">
                {isDevMode ? "🛠️ 管理者メニュー稼働中" : `${author}さんの講義録`}
              </h2>
              {entries.map((entry, index) => {
                // 🛠️ ロジック修正：自分の最新投稿（myLastIndex）より新しい（indexが小さい）他人の投稿を隠す
                const shouldBlur = !isDevMode && myLastIndex !== -1 && index < myLastIndex && entry.author !== author;

                return (
                  <div key={entry.id} className="bg-white p-5 rounded-3xl shadow-lg border-l-[12px] border-red-600 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-red-600 text-sm">【{entry.author}】</span>
                      <button onClick={() => handleDelete(entry.id)} className="text-gray-200 hover:text-red-600">🗑️</button>
                    </div>
                    <p className={shouldBlur ? "text-gray-800 blur-lg select-none font-bold opacity-20" : "text-gray-800 font-bold"}>{entry.content}</p>
                    {shouldBlur && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 border-2 border-red-600 rounded-3xl">
                        <p className="text-xl font-black text-red-600 mb-1 text-center italic">閲覧制限中</p>
                        <p className="text-[10px] font-bold text-gray-400">投稿するとロックが解除されます🔐</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-12 text-white font-black drop-shadow-md">名前を選択して開始してください。</div>
          )}
        </div>

        {/* 🛠️ 管理者ボタン */}
        <div className="fixed bottom-4 right-4 z-50">
          <button onClick={() => setShowConfirm(true)} className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-xs opacity-50 transition-all border border-white/30">🛠️</button>
        </div>

        {/* 🛠️ 確認ダイヤログ */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[60] backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl border-4 border-red-600 shadow-2xl max-w-xs w-full">
              <h3 className="text-xl font-black text-red-600 text-center mb-4">管理者ツール</h3>
              <div className="flex gap-4">
                <button onClick={() => { setIsDevMode(true); setShowConfirm(false); }} className="flex-1 bg-red-600 text-white font-black py-3 rounded-xl shadow-lg">はい</button>
                <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 text-gray-400 font-black py-3 rounded-xl border-2 border-gray-200">いいえ</button>
              </div>
            </div>
          </div>
        )}

        {/* 🛠️ 管理者メニュー */}
        {isDevMode && (
          <div className="fixed bottom-16 right-4 bg-red-700 text-white p-6 rounded-2xl shadow-2xl border-4 border-white w-64 animate-in slide-in-from-bottom-4">
            <button onClick={() => setIsDevMode(false)} className="absolute top-2 right-2 text-white/50 text-xs">✕</button>
            <button onClick={() => { fetchEntries(); alert('SYNC SUCCESS'); }} className="w-full text-center bg-white text-red-700 py-3 rounded-xl font-black shadow-lg">🔄 データを強制同期</button>
          </div>
        )}

      </div>
    </main>
  );
}
