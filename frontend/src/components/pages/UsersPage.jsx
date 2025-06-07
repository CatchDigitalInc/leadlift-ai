import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Settings
} from 'lucide-react'

// Sample users data
const sampleUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@leadlift.ai',
    role: 'admin',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    last_login: '2025-06-06T10:30:00Z'
  },
  {
    id: 2,
    username: 'john_manager',
    email: 'john@company.com',
    role: 'manager',
    is_active: true,
    created_at: '2025-02-15T00:00:00Z',
    last_login: '2025-06-05T14:20:00Z'
  },
  {
    id: 3,
    username: 'sarah_analyst',
    email: 'sarah@company.com',
    role: 'user',
    is_active: true,
    created_at: '2025-03-10T00:00:00Z',
    last_login: '2025-06-04T09:15:00Z'
  },
  {
    id: 4,
    username: 'mike_temp',
    email: 'mike@contractor.com',
    role: 'user',
    is_active: false,
    created_at: '2025-04-01T00:00:00Z',
    last_login: '2025-05-20T16:45:00Z'
  }
]

const getRoleColor = (role) => {
  const colors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    user: 'bg-green-100 text-green-800 border-green-200'
  }
  return colors[role] || colors.user
}

const getRoleIcon = (role) => {
  const icons = {
    admin: Crown,
    manager: Shield,
    user: Users
  }
  const Icon = icons[role] || Users
  return <Icon className="h-3 w-3" />
}

export function UsersPage() {
  const [users, setUsers] = useState(sampleUsers)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'user', password: '' })
  const [editUser, setEditUser] = useState({ username: '', email: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user: currentUser, API_BASE } = useAuth()

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin'

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // In a real implementation, this would call the API
      const newUserData = {
        id: users.length + 1,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null
      }

      setUsers([...users, newUserData])
      setNewUser({ username: '', email: '', role: 'user', password: '' })
      setShowAddDialog(false)
      setSuccess('User added successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!editUser.username || !editUser.email) {
      setError('Username and email are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // In a real implementation, this would call the API
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, username: editUser.username, email: editUser.email, role: editUser.role }
          : user
      )

      setUsers(updatedUsers)
      setShowEditDialog(false)
      setSelectedUser(null)
      setSuccess('User updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !user.is_active }
          : user
      )
      setUsers(updatedUsers)
      setSuccess('User status updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const updatedUsers = users.filter(user => user.id !== userId)
      setUsers(updatedUsers)
      setSuccess('User deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to delete user')
    }
  }

  const openEditDialog = (user) => {
    setSelectedUser(user)
    setEditUser({
      username: user.username,
      email: user.email,
      role: user.role
    })
    setShowEditDialog(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access user management. Contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team access and permissions for the LeadLift.ai dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with appropriate permissions
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddUser}>
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="e.g., john_doe"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., john@company.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter secure password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User - View analytics and submissions</SelectItem>
                        <SelectItem value="manager">Manager - Manage clients and users</SelectItem>
                        <SelectItem value="admin">Admin - Full system access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {users.length} users
          </Badge>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <UserX className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(user.created_at)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(user.last_login)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          disabled={user.id === currentUser?.id && user.role === 'admin'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          {user.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id || user.role === 'admin'}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <form onSubmit={handleEditUser}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editUser.username}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={editUser.role} 
                    onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                    disabled={selectedUser.id === currentUser?.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User - View analytics and submissions</SelectItem>
                      <SelectItem value="manager">Manager - Manage clients and users</SelectItem>
                      <SelectItem value="admin">Admin - Full system access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

