import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Calendar,
  Target,
  Filter,
  Building2,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

// Sample data for different clients and industries
const clientsData = [
  { id: 'fe3a2fb8', name: 'Yama Vans', industry: 'Automotive', submissions: 234, avgScore: 78.5 },
  { id: 'abc123', name: 'TechFlow SaaS', industry: 'Technology', submissions: 189, avgScore: 82.1 },
  { id: 'def456', name: 'GreenLeaf Organic', industry: 'E-commerce', submissions: 156, avgScore: 71.3 },
  { id: 'ghi789', name: 'AutoParts Pro', industry: 'Automotive', submissions: 198, avgScore: 75.8 },
  { id: 'jkl012', name: 'CloudSync', industry: 'Technology', submissions: 267, avgScore: 84.2 }
]

const industryBenchmarks = {
  'Automotive': { avgSubmissions: 216, avgScore: 77.2, clients: 2 },
  'Technology': { avgSubmissions: 228, avgScore: 83.2, clients: 2 },
  'E-commerce': { avgSubmissions: 156, avgScore: 71.3, clients: 1 }
}

// Sample data for selected client
const getClientData = (clientId) => {
  const baseData = {
    'fe3a2fb8': {
      submissionsByDate: [
        { date: '2025-05-01', submissions: 12, leadScore: 76 },
        { date: '2025-05-02', submissions: 15, leadScore: 78 },
        { date: '2025-05-03', submissions: 8, leadScore: 74 },
        { date: '2025-05-04', submissions: 18, leadScore: 82 },
        { date: '2025-05-05', submissions: 14, leadScore: 79 },
        { date: '2025-05-06', submissions: 21, leadScore: 85 },
        { date: '2025-05-07', submissions: 11, leadScore: 73 }
      ],
      submissionsBySource: [
        { source: 'Google Ads', submissions: 89, percentage: 38, cost: 2340 },
        { source: 'Facebook', submissions: 67, percentage: 29, cost: 1890 },
        { source: 'Organic Search', submissions: 45, percentage: 19, cost: 0 },
        { source: 'Direct', submissions: 23, percentage: 10, cost: 0 },
        { source: 'Email', submissions: 10, percentage: 4, cost: 120 }
      ],
      leadQualityDistribution: [
        { quality: 'High (80-100)', count: 67, color: '#10b981' },
        { quality: 'Medium (60-79)', count: 123, color: '#f59e0b' },
        { quality: 'Low (40-59)', count: 34, color: '#ef4444' },
        { quality: 'Very Low (0-39)', count: 10, color: '#6b7280' }
      ]
    }
  }
  
  return baseData[clientId] || baseData['fe3a2fb8']
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']

export function AnalyticsPage() {
  const [selectedClient, setSelectedClient] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [viewMode, setViewMode] = useState('client') // 'client', 'industry', 'benchmark'
  const [dateRange, setDateRange] = useState('30d')
  const [clients, setClients] = useState(clientsData)
  const [loading, setLoading] = useState(false)
  const { API_BASE } = useAuth()

  const selectedClientData = selectedClient !== 'all' ? 
    clients.find(c => c.id === selectedClient) : null
  
  const clientAnalyticsData = selectedClient !== 'all' ? 
    getClientData(selectedClient) : null

  const industryClients = selectedIndustry !== 'all' ? 
    clients.filter(c => c.industry === selectedIndustry) : clients

  const currentBenchmark = selectedIndustry !== 'all' ? 
    industryBenchmarks[selectedIndustry] : null

  const getComparisonIndicator = (value, benchmark) => {
    if (!benchmark) return null
    const diff = ((value - benchmark) / benchmark) * 100
    const isPositive = diff > 0
    return {
      percentage: Math.abs(diff).toFixed(1),
      isPositive,
      icon: isPositive ? ArrowUpRight : ArrowDownRight,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {selectedClient === 'all' 
              ? 'Overview across all clients and industries'
              : `Detailed analytics for ${selectedClientData?.name}`
            }
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'client' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('client')}
            >
              <Users className="h-4 w-4 mr-1" />
              Client View
            </Button>
            <Button
              variant={viewMode === 'industry' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('industry')}
            >
              <Building2 className="h-4 w-4 mr-1" />
              Industry View
            </Button>
          </div>

          {/* Client Selector */}
          {viewMode === 'client' && (
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients (Benchmark)</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Industry Selector */}
          {viewMode === 'industry' && (
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Date Range */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Client-Specific Analytics */}
      {viewMode === 'client' && selectedClient !== 'all' && selectedClientData && (
        <>
          {/* Client Stats with Benchmarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total Submissions
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {selectedClientData.submissions}
                </div>
                {currentBenchmark && (() => {
                  const comparison = getComparisonIndicator(selectedClientData.submissions, currentBenchmark.avgSubmissions)
                  const Icon = comparison.icon
                  return (
                    <div className="flex items-center gap-1 text-xs">
                      <Icon className={`h-3 w-3 ${comparison.color}`} />
                      <span className={comparison.color}>
                        {comparison.percentage}% vs industry avg
                      </span>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                  Avg Lead Score
                </CardTitle>
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {selectedClientData.avgScore}
                </div>
                {currentBenchmark && (() => {
                  const comparison = getComparisonIndicator(selectedClientData.avgScore, currentBenchmark.avgScore)
                  const Icon = comparison.icon
                  return (
                    <div className="flex items-center gap-1 text-xs">
                      <Icon className={`h-3 w-3 ${comparison.color}`} />
                      <span className={comparison.color}>
                        {comparison.percentage}% vs industry avg
                      </span>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Industry
                </CardTitle>
                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {selectedClientData.industry}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {currentBenchmark?.clients} clients in group
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Performance
                </CardTitle>
                <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {selectedClientData.avgScore > (currentBenchmark?.avgScore || 75) ? 'Above Avg' : 'Below Avg'}
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Industry ranking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Client-Specific Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submissions & Lead Score Trend */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Submissions & Lead Quality Trend
                </CardTitle>
                <CardDescription>
                  Daily submissions and average lead score for {selectedClientData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={clientAnalyticsData.submissionsByDate}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis yAxisId="left" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Bar yAxisId="left" dataKey="submissions" fill="#3b82f6" name="Submissions" />
                      <Line yAxisId="right" type="monotone" dataKey="leadScore" stroke="#10b981" strokeWidth={3} name="Lead Score" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources with Cost */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Traffic Sources & Cost
                </CardTitle>
                <CardDescription>
                  Submissions by source with acquisition cost
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientAnalyticsData.submissionsBySource.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <div>
                          <p className="font-medium text-sm">{source.source}</p>
                          <p className="text-xs text-muted-foreground">{source.percentage}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{source.submissions}</p>
                        <p className="text-xs text-muted-foreground">
                          {source.cost > 0 ? `$${source.cost}` : 'Free'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lead Quality Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lead Quality Distribution
                </CardTitle>
                <CardDescription>
                  Quality breakdown for {selectedClientData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientAnalyticsData.leadQualityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ quality, count }) => `${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {clientAnalyticsData.leadQualityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Industry Benchmarking View */}
      {viewMode === 'industry' && (
        <div className="space-y-6">
          {/* Industry Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(industryBenchmarks).map(([industry, data]) => (
              <Card key={industry} className={`cursor-pointer transition-all ${selectedIndustry === industry ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedIndustry(industry)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {industry}
                  </CardTitle>
                  <CardDescription>{data.clients} clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Submissions</span>
                      <span className="font-medium">{data.avgSubmissions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Lead Score</span>
                      <span className="font-medium">{data.avgScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Industry Client Comparison */}
          {selectedIndustry !== 'all' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedIndustry} Industry - Client Performance
                </CardTitle>
                <CardDescription>
                  Compare clients within the {selectedIndustry} industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryClients}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="submissions" fill="#3b82f6" name="Submissions" />
                      <Bar dataKey="avgScore" fill="#10b981" name="Avg Lead Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* All Clients Benchmark View */}
      {viewMode === 'client' && selectedClient === 'all' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Clients Overview - Benchmarking Data</CardTitle>
              <CardDescription>
                High-level metrics across all clients for benchmarking purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{clients.length}</div>
                  <div className="text-sm text-muted-foreground">Total Clients</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(clients.reduce((sum, c) => sum + c.submissions, 0) / clients.length)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Submissions</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {(clients.reduce((sum, c) => sum + c.avgScore, 0) / clients.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Lead Score</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {Object.keys(industryBenchmarks).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Industries</div>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clients}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-muted-foreground"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="submissions" fill="#3b82f6" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

