'use client';

import { useState } from 'react';

export function PdfUploadForm({ sources }: { sources: Array<{ id: string; title: string; year: number }> }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('正在上传 PDF…');

    try {
      const response = await fetch('/api/pdf-import', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed');
      setMessage(`上传完成。导入任务：${result.job.id}`);
      event.currentTarget.reset();
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '上传失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="cloud-form" onSubmit={handleSubmit}>
      <label className="wide-field">
        PDF 文件
        <input name="file" type="file" accept="application/pdf,.pdf" required />
      </label>
      <label className="wide-field">
        对应来源
        <select name="source_id" defaultValue="">
          <option value="">尚未匹配来源</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.year} · {source.title}
            </option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button type="submit" disabled={busy}>{busy ? '上传中…' : '上传并建立任务'}</button>
      </div>
      {message && <div className="alert wide-field">{message}</div>}
    </form>
  );
}
