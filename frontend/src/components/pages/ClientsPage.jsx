import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Users, 
  Globe, 
  Code, 
  Calendar,
  MoreHorizontal,
  Copy,
  CheckCircle
} from 'lucide-react'

export function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showScriptDialog, setShowScriptDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [newClient, setNewClient] = useState({ name: '', domain: '', industry: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [scriptCopied, setScriptCopied] = useState(false)
  const { API_BASE } = useAuth()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE}/clients`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setClients(data.clients)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newClient)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setClients([...clients, data.client])
        setNewClient({ name: '', domain: '', industry: '' })
        setShowAddDialog(false)
        setSuccess('Client added successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to add client')
    }
  }

  const fetchTrackingScript = async (clientId) => {
    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}/tracking-script`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setSelectedClient({ ...selectedClient, script: data.script })
        setShowScriptDialog(true)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to fetch tracking script')
    }
  }

  const copyScript = async () => {
    if (selectedClient?.script) {
      await navigator.clipboard.writeText(selectedClient.script)
      setScriptCopied(true)
      setTimeout(() => setScriptCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client websites and tracking scripts
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client to start tracking their form submissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClient}>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Yama Vans"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Website Domain</Label>
                  <Input
                    id="domain"
                    placeholder="e.g., yamavans.com"
                    value={newClient.domain}
                    onChange={(e) => setNewClient({ ...newClient, domain: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Select value={newClient.industry || ''} onValueChange={(value) => setNewClient({ ...newClient, industry: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry for benchmarking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automotive">Automotive</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client List
          </CardTitle>
          <CardDescription>
            {clients.length} client{clients.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first client to start tracking form submissions.
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Client
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Forms</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {client.domain}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {client.client_id}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.forms_count || 0}</TableCell>
                    <TableCell>{client.submissions_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(client.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedClient(client)
                          fetchTrackingScript(client.client_id)
                        }}
                      >
                        <Code className="h-4 w-4" />
                        Get Script
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tracking Script Dialog */}
      <Dialog open={showScriptDialog} onOpenChange={setShowScriptDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tracking Script for {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              Copy this script and add it to the footer of your website to start tracking form submissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">HTML Script</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyScript}
                  className="gap-2"
                >
                  {scriptCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-64">
                {selectedClient?.script}
              </pre>
            </div>
            <Alert>
              <Code className="h-4 w-4" />
              <AlertDescription>
                Add this script to your website's footer, just before the closing &lt;/body&gt; tag. 
                It will automatically track all form submissions without interfering with existing functionality.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowScriptDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

