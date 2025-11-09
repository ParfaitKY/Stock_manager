import { useEffect, useState } from 'react';
import { api } from '../utils/api';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (e) {
      setError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const setRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}`, { role });
      await loadUsers();
    } catch (e) {
      setError('Échec de mise à jour du rôle');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      await loadUsers();
    } catch (e) {
      setError('Échec de suppression');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Administration des Utilisateurs</h1>
      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => setRole(u.id, 'user')} className="px-2 py-1 text-xs bg-gray-200 rounded">User</button>
                    <button onClick={() => setRole(u.id, 'admin')} className="px-2 py-1 text-xs bg-yellow-300 rounded">Admin</button>
                    <button onClick={() => deleteUser(u.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

