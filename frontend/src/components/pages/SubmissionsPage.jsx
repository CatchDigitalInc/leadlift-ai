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
  FileText, 
  Eye, 
  Filter,
  Download,
  Calendar,
  Mail,
  Phone,
  User,
  Globe,
  Target,
  Clock,
  MousePointer,
  Star
} from 'lucide-react'

// Sample submissions data
const sampleSubmissions = [
  {
    id: 1,
    form_id: 'contact-form',
    form_type: 'contact',
    form_url: 'https://yamavans.com/contact',
    page_title: 'Contact Us - Yama Vans',
    submission_date: '2025-06-06T10:30:00Z',
    email: 'john.doe@email.com',
    name: 'John Doe',
    phone: '+1-555-0123',
    initial_utm_source: 'google',
    initial_utm_medium: 'cpc',
    recent_utm_source: 'google',
    recent_utm_medium: 'cpc',
    lead_quality_score: 85,
    session_count: 3,
    engaged_session_duration: 240,
    pages_visited: 5,
    form_data: {
      message: 'Interested in custom van conversion',
      budget: '$50,000-$75,000',
      timeline: '3-6 months'
    }
  },
  {
    id: 2,
    form_id: 'newsletter-signup',
    form_type: 'newsletter',
    form_url: 'https://yamavans.com/',
    page_title: 'Home - Yama Vans',
    submission_date: '2025-06-06T09:15:00Z',
    email: 'sarah.smith@email.com',
    name: 'Sarah Smith',
    phone: null,
    initial_utm_source: 'facebook',
    initial_utm_medium: 'social',
    recent_utm_source: 'facebook',
    recent_utm_medium: 'social',
    lead_quality_score: 45,
    session_count: 1,
    engaged_session_duration: 90,
    pages_visited: 2,
    form_data: {
      interests: 'Van life tips, Product updates'
    }
  },
  {
    id: 3,
    form_id: 'quote-request',
    form_type: 'lead',
    form_url: 'https://yamavans.com/quote',
    page_title: 'Get Quote - Yama Vans',
    submission_date: '2025-06-06T08:45:00Z',
    email: 'mike.johnson@email.com',
    name: 'Mike Johnson',
    phone: '+1-555-0456',
    initial_utm_source: 'organic',
    initial_utm_medium: 'search',
    recent_utm_source: 'organic',
    recent_utm_medium: 'search',
    lead_quality_score: 92,
    session_count: 5,
    engaged_session_duration: 420,
    pages_visited: 8,
    form_data: {
      van_model: 'Ford Transit',
      conversion_type: 'Full conversion',
      budget: '$75,000+',
      timeline: 'ASAP'
    }
  }
]

const getLeadQualityColor = (score) => {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

const getLeadQualityLabel = (score) => {
  if (score >= 80) return 'High Quality'
  if (score >= 60) return 'Medium Quality'
  if (score >= 40) return 'Low Quality'
  return 'Very Low Quality'
}

const getFormTypeColor = (type) => {
  const colors = {
    contact: 'bg-blue-100 text-blue-800',
    lead: 'bg-green-100 text-green-800',
    signup: 'bg-purple-100 text-purple-800',
    newsletter: 'bg-orange-100 text-orange-800',
    quote: 'bg-emerald-100 text-emerald-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return colors[type] || colors.other
}

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState(sampleSubmissions)
  const [filteredSubmissions, setFilteredSubmissions] = useState(sampleSubmissions)
  const [selectedClient, setSelectedClient] = useState('fe3a2fb8') // Yama Vans
  const [selectedForm, setSelectedForm] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedQuality, setSelectedQuality] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [loading, setLoading] = useState(false)
  const { API_BASE } = useAuth()

  // Sample clients for dropdown
  const clients = [
    { id: 'fe3a2fb8', name: 'Yama Vans' },
    { id: 'abc123', name: 'TechFlow SaaS' },
    { id: 'def456', name: 'GreenLeaf Organic' }
  ]

  // Get unique values for filters
  const uniqueForms = [...new Set(submissions.map(s => s.form_id))].filter(Boolean)
  const uniqueSources = [...new Set(submissions.map(s => s.initial_utm_source || s.recent_utm_source || 'Direct'))].filter(Boolean)

  useEffect(() => {
    applyFilters()
  }, [selectedClient, selectedForm, selectedSource, selectedQuality, searchTerm, submissions])

  const applyFilters = () => {
    let filtered = submissions

    // Filter by form
    if (selectedForm !== 'all') {
      filtered = filtered.filter(s => s.form_id === selectedForm)
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(s => 
        (s.initial_utm_source || s.recent_utm_source || 'Direct') === selectedSource
      )
    }

    // Filter by quality
    if (selectedQuality !== 'all') {
      filtered = filtered.filter(s => {
        const score = s.lead_quality_score
        switch (selectedQuality) {
          case 'high': return score >= 80
          case 'medium': return score >= 60 && score < 80
          case 'low': return score >= 40 && score < 60
          case 'very-low': return score < 40
          default: return true
        }
      })
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s => 
        s.email?.toLowerCase().includes(term) ||
        s.name?.toLowerCase().includes(term) ||
        s.phone?.includes(term) ||
        s.form_id?.toLowerCase().includes(term)
      )
    }

    setFilteredSubmissions(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Form Submissions</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze all form submissions with detailed lead scoring
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            {filteredSubmissions.length} submissions
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Client Selector */}
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Filter */}
            <div className="space-y-2">
              <Label>Form</Label>
              <Select value={selectedForm} onValueChange={setSelectedForm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {uniqueForms.map(form => (
                    <SelectItem key={form} value={form}>
                      {form.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <Label>Traffic Source</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality Filter */}
            <div className="space-y-2">
              <Label>Lead Quality</Label>
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="high">High (80-100)</SelectItem>
                  <SelectItem value="medium">Medium (60-79)</SelectItem>
                  <SelectItem value="low">Low (40-59)</SelectItem>
                  <SelectItem value="very-low">Very Low (0-39)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2 lg:col-span-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by email, name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            All form submissions with lead quality scoring and UTM attribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Lead Score</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(submission.submission_date)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{submission.email}</span>
                        </div>
                        {submission.name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{submission.name}</span>
                          </div>
                        )}
                        {submission.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{submission.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className={getFormTypeColor(submission.form_type)}>
                          {submission.form_type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {submission.form_id}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {submission.initial_utm_source || submission.recent_utm_source || 'Direct'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {submission.initial_utm_medium || submission.recent_utm_medium || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getLeadQualityColor(submission.lead_quality_score)}>
                          <Target className="h-3 w-3 mr-1" />
                          {submission.lead_quality_score}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {getLeadQualityLabel(submission.lead_quality_score)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {submission.session_count} sessions
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(submission.engaged_session_duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {submission.pages_visited} pages
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Submission Details</DialogTitle>
                            <DialogDescription>
                              Complete form submission data and analytics
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSubmission && (
                            <div className="space-y-6">
                              {/* Contact Information */}
                              <div>
                                <h3 className="font-semibold mb-3">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Email</Label>
                                    <p className="text-sm">{selectedSubmission.email}</p>
                                  </div>
                                  <div>
                                    <Label>Name</Label>
                                    <p className="text-sm">{selectedSubmission.name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <p className="text-sm">{selectedSubmission.phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label>Lead Score</Label>
                                    <Badge className={getLeadQualityColor(selectedSubmission.lead_quality_score)}>
                                      {selectedSubmission.lead_quality_score} - {getLeadQualityLabel(selectedSubmission.lead_quality_score)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Form Details */}
                              <div>
                                <h3 className="font-semibold mb-3">Form Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Form ID</Label>
                                    <p className="text-sm">{selectedSubmission.form_id}</p>
                                  </div>
                                  <div>
                                    <Label>Form Type</Label>
                                    <Badge className={getFormTypeColor(selectedSubmission.form_type)}>
                                      {selectedSubmission.form_type}
                                    </Badge>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Page URL</Label>
                                    <p className="text-sm break-all">{selectedSubmission.form_url}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Page Title</Label>
                                    <p className="text-sm">{selectedSubmission.page_title}</p>
                                  </div>
                                </div>
                              </div>

                              {/* UTM Attribution */}
                              <div>
                                <h3 className="font-semibold mb-3">UTM Attribution</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Initial Source</Label>
                                    <p className="text-sm">{selectedSubmission.initial_utm_source || 'Direct'}</p>
                                  </div>
                                  <div>
                                    <Label>Initial Medium</Label>
                                    <p className="text-sm">{selectedSubmission.initial_utm_medium || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label>Recent Source</Label>
                                    <p className="text-sm">{selectedSubmission.recent_utm_source || 'Direct'}</p>
                                  </div>
                                  <div>
                                    <Label>Recent Medium</Label>
                                    <p className="text-sm">{selectedSubmission.recent_utm_medium || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Engagement Metrics */}
                              <div>
                                <h3 className="font-semibold mb-3">Engagement Metrics</h3>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label>Sessions</Label>
                                    <p className="text-sm">{selectedSubmission.session_count}</p>
                                  </div>
                                  <div>
                                    <Label>Time on Site</Label>
                                    <p className="text-sm">{formatDuration(selectedSubmission.engaged_session_duration)}</p>
                                  </div>
                                  <div>
                                    <Label>Pages Visited</Label>
                                    <p className="text-sm">{selectedSubmission.pages_visited}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Form Data */}
                              {selectedSubmission.form_data && Object.keys(selectedSubmission.form_data).length > 0 && (
                                <div>
                                  <h3 className="font-semibold mb-3">Form Data</h3>
                                  <div className="space-y-2">
                                    {Object.entries(selectedSubmission.form_data).map(([key, value]) => (
                                      <div key={key} className="grid grid-cols-3 gap-4">
                                        <Label className="capitalize">{key.replace(/[_-]/g, ' ')}</Label>
                                        <p className="text-sm col-span-2">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No submissions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new submissions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

