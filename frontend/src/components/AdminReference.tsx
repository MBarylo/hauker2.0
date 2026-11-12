import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

type Kind = 'roles' | 'post-types';
type Row = {
  id: number;
  name: string;
  description: string | null;
  usage: number;
};

const SYSTEM_IDS: Record<Kind, number[]> = {
  roles: [1, 2],
  'post-types': [1, 2, 3],
};

const btn: React.CSSProperties = {
  padding: '6px 12px',
  background: 'var(--btn)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text)',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
};

const dangerBtn: React.CSSProperties = {
  ...btn,
  background: 'rgba(248, 81, 73, 0.1)',
  border: '1px solid var(--danger)',
  color: 'var(--danger)',
};

const errMsg = (e: any) => {
  const m = e?.response?.data?.message;
  return Array.isArray(m) ? m.join(', ') : (m ?? 'Something went wrong');
};

const AdminReference = () => {
  const [kind, setKind] = useState<Kind>('roles');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const load = useCallback(async () => {
    const res = await api.get(`/admin/reference/${kind}`);
    setRows(res.data);
  }, [kind]);

  useEffect(() => {
    setError('');
    setEditId(null);
    setNewName('');
    setNewDesc('');
    load();
  }, [load]);

  const add = async () => {
    setError('');
    try {
      await api.post(`/admin/reference/${kind}`, {
        name: newName,
        description: newDesc,
      });
      setNewName('');
      setNewDesc('');
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const startEdit = (r: Row) => {
    setError('');
    setEditId(r.id);
    setEditName(r.name);
    setEditDesc(r.description ?? '');
  };

  const save = async (id: number) => {
    setError('');
    try {
      await api.patch(`/admin/reference/${kind}/${id}`, {
        name: editName,
        description: editDesc,
      });
      setEditId(null);
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const remove = async (id: number) => {
    setError('');
    try {
      await api.delete(`/admin/reference/${kind}/${id}`);
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const usedBy = kind === 'roles' ? 'users' : 'posts';

  return (
    <div>
      {/* перемикач довідників */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['roles', 'post-types'] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            style={{
              ...btn,
              background: kind === k ? 'var(--accent-muted)' : 'var(--btn)',
              borderColor: kind === k ? 'var(--accent)' : 'var(--border)',
              color: kind === k ? 'var(--accent)' : 'var(--text)',
            }}
          >
            {k === 'roles' ? 'Roles' : 'Post types'}
          </button>
        ))}
      </div>

      {error && (
        <p className="error" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* форма додавання */}
      <div className="post" style={{ cursor: 'default' }}>
        <p style={{ fontWeight: 600 }}>
          Add {kind === 'roles' ? 'role' : 'post type'}
        </p>
        <input
          placeholder="Name"
          value={newName}
          maxLength={50}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <div>
          <button
            style={{ ...btn, opacity: newName.trim() ? 1 : 0.5 }}
            disabled={!newName.trim()}
            onClick={add}
          >
            ➕ Add
          </button>
        </div>
      </div>

      {/* список */}
      {rows.map((r) => {
        const system = SYSTEM_IDS[kind].includes(r.id);
        const canDelete = !system && r.usage === 0;
        const editing = editId === r.id;

        return (
          <div key={r.id} className="post" style={{ cursor: 'default' }}>
            {editing ? (
              <>
                <input
                  value={editName}
                  maxLength={50}
                  disabled={system}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  value={editDesc}
                  placeholder="Description"
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={btn} onClick={() => save(r.id)}>
                    Save
                  </button>
                  <button style={btn} onClick={() => setEditId(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--accent)' }}>
                    #{r.id} {r.name}
                    {system && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        system
                      </span>
                    )}
                  </p>
                  {r.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {r.description}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    used by {r.usage} {usedBy}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={btn} onClick={() => startEdit(r)}>
                    Edit
                  </button>
                  <button
                    style={{
                      ...dangerBtn,
                      opacity: canDelete ? 1 : 0.4,
                      cursor: canDelete ? 'pointer' : 'not-allowed',
                    }}
                    disabled={!canDelete}
                    title={
                      system
                        ? 'System value'
                        : r.usage > 0
                          ? 'Value is in use'
                          : ''
                    }
                    onClick={() => remove(r.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminReference;
