'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { Task, Priority, Status, AuthUser } from '@/lib/types';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

/* ─── config maps ──────────────────────────────────────────────────────────── */
const PRIORITY = {
  HIGH:   { label: 'Yüksək', color: '#c8373a', bg: 'rgba(200,55,58,0.08)',   dot: '#c8373a', num: 3 },
  MEDIUM: { label: 'Orta',   color: '#b5651d', bg: 'rgba(181,101,29,0.08)',  dot: '#b5651d', num: 2 },
  LOW:    { label: 'Aşağı',  color: '#2d6a4f', bg: 'rgba(45,106,79,0.08)',   dot: '#2d6a4f', num: 1 },
};

/* ─── shared style helpers ─────────────────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--paper)',
  border: '1.5px solid var(--rule2)',
  borderRadius: 0,
  color: 'var(--ink)',
  fontSize: 14,
  fontFamily: 'Figtree, sans-serif',
  outline: 'none',
  transition: 'border-color .15s',
};

const btn = (primary = false): React.CSSProperties => ({
  padding: primary ? '11px 28px' : '10px 20px',
  background: primary ? 'var(--ink)' : 'transparent',
  border: `1.5px solid ${primary ? 'var(--ink)' : 'var(--rule2)'}`,
  borderRadius: 0,
  color: primary ? 'var(--paper)' : 'var(--ink2)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  fontFamily: 'Figtree, sans-serif',
  transition: 'all .15s',
});

/* ─── component ────────────────────────────────────────────────────────────── */
export default function Home() {
  const [token, setToken]   = useState<string | null>(null);
  const [user,  setUser]    = useState<AuthUser | null>(null);
  const [tasks, setTasks]   = useState<Task[]>([]);

  // auth
  const [authMode,    setAuthMode]    = useState<'login' | 'register'>('login');
  const [authForm,    setAuthForm]    = useState({ name: '', email: '', password: '' });
  const [authError,   setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // filter
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search,         setSearch]         = useState('');

  // modal
  const [showModal,   setShowModal]   = useState(false);
  const [editTask,    setEditTask]    = useState<Task | null>(null);
  const [form,        setForm]        = useState({ title: '', description: '', priority: 'MEDIUM' as Priority, dueDate: '' });
  const [formError,   setFormError]   = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  /* hydrate from localStorage */
  useEffect(() => {
    const t = localStorage.getItem('tf_token');
    const u = localStorage.getItem('tf_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
  }, []);

  /* fetch tasks */
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filterStatus   !== 'all') p.set('status',   filterStatus);
      if (filterPriority !== 'all') p.set('priority', filterPriority);
      if (search)                   p.set('search',   search);
      const data = await apiFetch(`/api/tasks?${p}`, {}, token);
      setTasks(data.tasks);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token, filterStatus, filterPriority, search]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* auth submit */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthLoading(true);
    try {
      const path = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const data = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem('tf_token', data.token);
      localStorage.setItem('tf_user',  JSON.stringify(data.user));
      setToken(data.token); setUser(data.user);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Xəta');
    } finally { setAuthLoading(false); }
  };

  const logout = () => {
    ['tf_token','tf_user'].forEach(k => localStorage.removeItem(k));
    setToken(null); setUser(null); setTasks([]);
  };

  /* modal helpers */
  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
    setFormError(''); setShowModal(true);
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setForm({ title: t.title, description: t.description || '', priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0,10) : '' });
    setFormError(''); setShowModal(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!form.title.trim()) { setFormError('Başlıq tələb olunur'); return; }
    setFormLoading(true);
    try {
      if (editTask) {
        await apiFetch(`/api/tasks/${editTask.id}`, { method: 'PUT', body: JSON.stringify(form) }, token!);
      } else {
        await apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(form) }, token!);
      }
      setShowModal(false); fetchTasks();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Xəta');
    } finally { setFormLoading(false); }
  };

  const toggleStatus = async (t: Task) => {
    const newStatus: Status = t.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await apiFetch(`/api/tasks/${t.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) }, token!);
      fetchTasks();
    } catch { /* silent */ }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/tasks/${deleteId}`, { method: 'DELETE' }, token!);
      setDeleteId(null); fetchTasks();
    } catch { /* silent */ }
  };

  /* stats */
  const stats = {
    total:     tasks.length,
    pending:   tasks.filter(t => t.status === 'PENDING').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    high:      tasks.filter(t => t.priority === 'HIGH' && t.status === 'PENDING').length,
  };

  /* overlay style */
  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(26,23,20,0.55)',
    backdropFilter: 'blur(4px)',
    zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  };

  const panel: React.CSSProperties = {
    width: '100%', maxWidth: 500,
    background: 'var(--paper)',
    border: '2px solid var(--ink)',
    borderRadius: 0,
    padding: 36,
    boxShadow: '6px 6px 0 var(--ink)',
  };

  /* ══════════════════════════════════════════════════════════════════════════
     AUTH SCREEN
  ══════════════════════════════════════════════════════════════════════════ */
  if (!token) return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>

      {/* ruled-paper background lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--rule) 31px, var(--rule) 32px)', opacity: 0.4, pointerEvents: 'none' }} />

      {/* masthead */}
      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
        <div style={{ display: 'inline-block', borderBottom: '3px double var(--ink)', paddingBottom: 12, marginBottom: 10 }}>
          <h1 className="font-serif" style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1px', color: 'var(--ink)', lineHeight: 1 }}>
            Task<span style={{ color: 'var(--red)', fontStyle: 'italic' }}>Flow</span>
          </h1>
        </div>
        <p className="font-mono" style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Java Edition · v{APP_VERSION}
        </p>
      </div>

      {/* auth card */}
      <div style={{ ...panel, maxWidth: 420, position: 'relative' }}>
        {/* tab strip */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--ink)', marginBottom: 28 }}>
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setAuthError(''); }}
              style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', borderBottom: authMode === m ? '3px solid var(--red)' : '3px solid transparent', marginBottom: -2, cursor: 'pointer', fontFamily: 'Figtree, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: authMode === m ? 'var(--ink)' : 'var(--ink3)', transition: 'all .15s' }}>
              {m === 'login' ? 'Giriş' : 'Qeydiyyat'}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth}>
          {authMode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>Ad Soyad</label>
              <input value={authForm.name} onChange={e => setAuthForm(p => ({...p, name: e.target.value}))} placeholder="Adınızı yazın" required style={inp} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>Email</label>
            <input type="email" value={authForm.email} onChange={e => setAuthForm(p => ({...p, email: e.target.value}))} placeholder="email@domain.com" required style={inp} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>Şifrə</label>
            <input type="password" value={authForm.password} onChange={e => setAuthForm(p => ({...p, password: e.target.value}))} placeholder="Ən az 6 simvol" required style={inp} />
          </div>

          {authError && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(200,55,58,0.3)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>
              {authError}
            </div>
          )}
          <button type="submit" disabled={authLoading} style={{ ...btn(true), width: '100%', opacity: authLoading ? 0.6 : 1 }}>
            {authLoading ? 'Gözləyin...' : authMode === 'login' ? 'Daxil ol' : 'Qeydiyyatdan keç'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 32, fontSize: 11, color: 'var(--ink3)', position: 'relative' }} className="font-mono">
        Spring Boot · MongoDB · JWT
      </p>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN APP
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>

      {/* ── Header / Masthead ─────────────────────────────────────────────── */}
      <header style={{ borderBottom: '3px double var(--ink)', background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          {/* top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--rule)' }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.08em' }}>
              TASKFLOW JAVA · v{APP_VERSION}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>{user?.name}</span>
              <a href="/api/health" target="_blank" style={{ fontSize: 11, color: 'var(--ink3)', textDecoration: 'none', fontFamily: 'IBM Plex Mono, monospace' }}>health ↗</a>
              <button onClick={logout} style={{ ...btn(), fontSize: 11, padding: '5px 14px' }}>Çıxış</button>
            </div>
          </div>
          {/* title row */}
          <div style={{ padding: '10px 0', display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px' }}>
              Task<span style={{ fontStyle: 'italic', color: 'var(--red)' }}>Flow</span>
            </h1>
            <span style={{ fontSize: 13, color: 'var(--ink3)', fontStyle: 'italic' }}>— şəxsi tapşırıq idarəetməsi</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '2px solid var(--ink)', marginBottom: 36 }}>
          {[
            { label: 'Cəmi',        value: stats.total,     color: 'var(--ink)' },
            { label: 'Gözləyən',    value: stats.pending,   color: 'var(--amber)' },
            { label: 'Tamamlanan',  value: stats.completed, color: 'var(--green)' },
            { label: 'Təcili',      value: stats.high,      color: 'var(--red)' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid var(--ink)' : 'none', textAlign: 'center' }}>
              <div className="font-serif" style={{ fontSize: 40, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Controls ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--ink3)', pointerEvents: 'none' }}>↳</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Axtar..."
              style={{ ...inp, paddingLeft: 34 }} />
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
            <option value="all">Bütün statuslar</option>
            <option value="PENDING">Gözləyən</option>
            <option value="COMPLETED">Tamamlanmış</option>
          </select>

          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
            <option value="all">Bütün prioritetlər</option>
            <option value="HIGH">Yüksək</option>
            <option value="MEDIUM">Orta</option>
            <option value="LOW">Aşağı</option>
          </select>

          <button onClick={openCreate} style={{ ...btn(true), whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 300 }}>+</span> Yeni Task
          </button>
        </div>

        {/* ── Task list ────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink3)' }}>
            <div className="font-serif" style={{ fontSize: 22, fontStyle: 'italic' }}>Yüklənir…</div>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--rule2)' }}>
            <div className="font-serif" style={{ fontSize: 28, fontStyle: 'italic', color: 'var(--ink3)', marginBottom: 10 }}>Heç bir task yoxdur</div>
            <div style={{ fontSize: 13, color: 'var(--ink3)' }}>Yeni task yaradın və ya filteri dəyişin</div>
          </div>
        ) : (
          <div style={{ border: '2px solid var(--ink)' }}>
            {/* table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 90px 110px 180px', gap: 0, padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)', borderBottom: '2px solid var(--ink)' }}>
              {['', 'Başlıq', 'Prioritet', 'Status', 'Son tarix', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 4px' }}>{h}</div>
              ))}
            </div>

            {tasks.map((task, idx) => {
              const pcfg = PRIORITY[task.priority];
              const done = task.status === 'COMPLETED';
              const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !done;

              return (
                <div key={task.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 100px 90px 110px 180px',
                  gap: 0,
                  padding: '14px 16px',
                  borderBottom: idx < tasks.length - 1 ? '1px solid var(--rule)' : 'none',
                  background: done ? 'var(--paper2)' : 'var(--paper)',
                  alignItems: 'center',
                  transition: 'background .15s',
                  opacity: done ? 0.7 : 1,
                }}>
                  {/* checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => toggleStatus(task)} style={{
                      width: 18, height: 18, border: `2px solid ${done ? 'var(--green)' : 'var(--rule2)'}`,
                      borderRadius: 0, background: done ? 'var(--green)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--paper)', fontSize: 11, fontWeight: 700, transition: 'all .15s',
                    }}>
                      {done && '✓'}
                    </button>
                  </div>

                  {/* title + description */}
                  <div style={{ padding: '0 12px', minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: done ? 'var(--ink3)' : 'var(--ink)', textDecoration: done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.description}
                      </div>
                    )}
                  </div>

                  {/* priority */}
                  <div style={{ padding: '0 4px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 8px', background: pcfg.bg, color: pcfg.color, letterSpacing: '0.04em' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: pcfg.color, flexShrink: 0 }} />
                      {pcfg.label}
                    </span>
                  </div>

                  {/* status */}
                  <div style={{ padding: '0 4px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: done ? 'var(--green)' : 'var(--amber)', letterSpacing: '0.04em' }}>
                      {done ? '● Tamamdı' : '○ Gözləyir'}
                    </span>
                  </div>

                  {/* due date */}
                  <div style={{ padding: '0 4px', fontSize: 12, color: overdue ? 'var(--red)' : 'var(--ink3)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('az-AZ') : '—'}
                    {overdue && <span style={{ marginLeft: 4, fontSize: 10 }}>(!)</span>}
                  </div>

                  {/* actions */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '0 0 0 4px' }}>
                    <button onClick={() => openEdit(task)} style={{ ...btn(), fontSize: 11, padding: '4px 12px' }}>Düzəlt</button>
                    <button onClick={() => setDeleteId(task.id)} style={{ fontSize: 11, padding: '4px 12px', background: 'transparent', border: '1.5px solid rgba(200,55,58,0.4)', borderRadius: 0, color: 'var(--red)', cursor: 'pointer', fontFamily: 'Figtree, sans-serif', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sil</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '3px double var(--ink)', marginTop: 60, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
          TaskFlow Java Edition · v{APP_VERSION}
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
          Spring Boot 3.2 + MongoDB + JWT · Next.js 15
        </span>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════════
          TASK MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '2px solid var(--ink)', paddingBottom: 16 }}>
              <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 700, fontStyle: 'italic' }}>
                {editTask ? 'Taskı düzəlt' : 'Yeni task yarat'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--ink3)', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            <form onSubmit={submitForm}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>Başlıq *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Task başlığı..." style={inp} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>Açıqlama</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Ətraflı açıqlama..." rows={3}
                  style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>Prioritet</label>
                  <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value as Priority}))} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="LOW">Aşağı</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksək</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>Son tarix</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))}
                    style={{ ...inp, colorScheme: 'light', color: form.dueDate ? 'var(--ink)' : 'var(--ink3)' }} />
                </div>
              </div>

              {formError && (
                <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(200,55,58,0.3)', padding: '10px 14px', marginBottom: 18, fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>
                  {formError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...btn(), flex: 1 }}>Ləğv et</button>
                <button type="submit" disabled={formLoading} style={{ ...btn(true), flex: 2, opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? 'Gözləyin...' : editTask ? 'Yadda saxla' : 'Yarat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DELETE CONFIRM
      ══════════════════════════════════════════════════════════════════════ */}
      {deleteId && (
        <div style={overlay}>
          <div style={{ ...panel, maxWidth: 380, textAlign: 'center' }}>
            <div className="font-serif" style={{ fontSize: 28, fontStyle: 'italic', marginBottom: 12 }}>Silmək istəyirsiniz?</div>
            <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 28, lineHeight: 1.6 }}>
              Bu task birdəfəlik silinəcək.<br />Əməliyyat geri alına bilməz.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={{ ...btn(), flex: 1 }}>Ləğv et</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '11px 20px', background: 'var(--red)', border: '1.5px solid var(--red)', borderRadius: 0, color: 'var(--paper)', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
