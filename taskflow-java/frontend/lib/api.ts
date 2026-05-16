const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiFetch = async (
  path: string,
  opts: RequestInit = {},
  token?: string
) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Xəta baş verdi');
  return data;
};
