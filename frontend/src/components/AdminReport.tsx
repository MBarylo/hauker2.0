import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

type ReportRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  posts: number;
  comments: number;
  likes_given: number;
  followers: number;
};

const AdminReport = ({ admin }: { admin: string }) => {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generated] = useState(() => new Date());

  useEffect(() => {
    api
      .get('/admin/report/users')
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(
    () =>
      rows.reduce(
        (t, r) => ({
          posts: t.posts + r.posts,
          comments: t.comments + r.comments,
          likes: t.likes + r.likes_given,
        }),
        { posts: 0, comments: 0, likes: 0 },
      ),
    [rows],
  );

  return (
    <div>
      <div className="no-print" style={{ marginBottom: 12 }}>
        <button
          onClick={() => window.print()}
          disabled={loading || rows.length === 0}
          style={{
            padding: '8px 16px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          🖨 Print report
        </button>
      </div>

      <div className="report">
        <h2 className="report-title">User activity report</h2>
        <p className="report-meta">
          Hauker · generated {generated.toLocaleString('en-GB')} by {admin}
        </p>

        {loading && <p className="empty">Loading…</p>}

        {!loading && (
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Posts</th>
                <th>Comments</th>
                <th>Likes given</th>
                <th>Followers</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.username}</td>
                  <td>{r.email}</td>
                  <td>{r.role}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>{r.posts}</td>
                  <td>{r.comments}</td>
                  <td>{r.likes_given}</td>
                  <td>{r.followers}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>Total ({rows.length} users)</td>
                <td>{totals.posts}</td>
                <td>{totals.comments}</td>
                <td>{totals.likes}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}

        <div className="report-sign">
          <span>Administrator: ______________________</span>
          <span>Date: ______________</span>
        </div>
      </div>
    </div>
  );
};

export default AdminReport;
