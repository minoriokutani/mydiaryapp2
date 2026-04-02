'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚠️ ここにあなたの情報を設定
const supabase = createClient(
  'https://qgxowaukvqqvkujdkper.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFneG93YXVrdnFxdmt1amRrcGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDE2NTQsImV4cCI6MjA5MDY3NzY1NH0.r-CFEWuBKH8x4SJM1Nk7JfL-EIKMs5JuTi50dvhwxag'
);

export default function Home() {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const myLastIndex = entries.findIndex(e => e.author === author);

  const handlePost = async () => {
    if (!content || !author) {
      alert('名前を選んで内容を書いてね！');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('diary_entries')
      .insert([{ content, author }]);

    if (!error) {
      setContent('');
      fetchEntries();
    } else {
      alert('エラー: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-yellow-100 p-8 text-black font-sans">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">📔 二人の交換日記</h1>
        
        {/* 名前選択・入力エリア */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-2 border-yellow-200">
          <p className="text-sm font-bold mb-4 text-gray-500 text-center">あなたはどっち？</p>
          <div className="flex gap-4 mb-6">
            {['自分', '相手の名前'].map((name) => (
              <button
                key={name}
                onClick={() => setAuthor(name)}
                className={
                  author === name 
                    ? "flex-1 py-3 rounded-xl font-bold border-2 bg-blue-500 text-white border-blue-500" 
                    : "flex-1 py-3 rounded-xl font-bold border-2 bg-white text-blue-500 border-blue-500"
                }
              >
                {name}
              </button>
            ))}
          </div>

          {author && (
            <div className="animate-in fade-in duration-500">
              <textarea
                className="w-full p-4 border-2 border-gray-100 rounded-xl mb-4 text-black bg-gray-50 focus:bg-white outline-none"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${author}として今の気持ちを書く...`}
              />
              <button
                onClick={handlePost}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg"
              >
                {loading ? "投函中..." : "日記を投函する ✉️"}
              </button>
            </div>
          )}
        </div>

        {/* リスト表示エリア（名前選択時のみ表示） */}
        <div className="space-y-6">
          {author ? (
            <>
              <h2 className="font-bold text-lg border-b-2 border-yellow-300 pb-2">
                {author}さんの視点
              </h2>
              {entries.map((entry, index) => {
                const shouldBlur = myLastIndex !== -1 && index < myLastIndex && entry.author !== author;

                return (
                  <div key={entry.id} className="bg-white p-5 rounded-xl shadow-sm border-l-8 border-blue-400 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm">
                        {entry.author}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(entry.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    
                    <p className={shouldBlur ? "text-gray-800 whitespace-pre-wrap blur-md select-none" : "text-gray-800 whitespace-pre-wrap"}>
                      {entry.content}
                    </p>

                    {shouldBlur && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center p-4">
                        <p className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded shadow">
                          書いたら読めるよ🔐
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">名前を選択すると、<br />日記が表示されます。</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}