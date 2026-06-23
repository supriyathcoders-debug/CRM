import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api, getApiErrorMessage } from '@/lib/api';
import { formatLastChange, formatLastChangeDate, type LastChange } from '@/lib/audit';

interface Role {
  id: string;
  name: string;
  displayName: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  role: Role;
  employee?: { employeeCode: string } | null;
  lastChange?: LastChange | null;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/admin/users', { params: { search: search || undefined, limit: 50 } }),
        api.get('/roles'),
      ]);
      setUsers(usersRes.data.data ?? []);
      setRoles(rolesRes.data.data ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateUser = async (id: string, data: { roleId?: string; status?: string }) => {
    try {
      await api.patch(`/admin/users/${id}`, data);
      toast.success('User updated');
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserCog className="h-7 w-7 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground">Manage users, roles, and account status</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex gap-2 max-w-md"
      >
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : users.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Last changed</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="p-3">
                        <p className="font-medium">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                        {u.employee && (
                          <p className="text-xs font-mono">{u.employee.employeeCode}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          value={u.role.id}
                          onChange={(e) => updateUser(u.id, { roleId: e.target.value })}
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.displayName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{u.status}</Badge>
                      </td>
                      <td className="p-3 text-xs">
                        <p>{formatLastChange(u.lastChange)}</p>
                        {u.lastChange?.at && (
                          <p className="text-muted-foreground">{formatLastChangeDate(u.lastChange)}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          value={u.status}
                          onChange={(e) => updateUser(u.id, { status: e.target.value })}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
