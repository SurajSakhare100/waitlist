'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Users, TrendingUp, Mail, Download, Search, Filter, Eye, Settings, Code, Share, Pencil } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from 'next/navigation'

interface Submission {
  _id: string
  email: string
  position: number
  referralCode: string
  referralCount: number
  isEmailVerified: boolean
  createdAt: string
}

interface Waitlist {
  _id: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  submissionCount: number
}

export default function WaitlistDetailPage() {
  const [waitlist, setWaitlist] = useState<Waitlist | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchWaitlistData()
  }, [params.id])

  const fetchWaitlistData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch waitlist details
      const waitlistResponse = await fetch(`/api/waitlists/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Fetch submissions
      const submissionsResponse = await fetch(`/api/waitlists/${params.id}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (waitlistResponse.ok && submissionsResponse.ok) {
        const waitlistData = await waitlistResponse.json()
        const submissionsData = await submissionsResponse.json()
        
        setWaitlist(waitlistData.waitlist)
        setSubmissions(submissionsData.submissions)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching waitlist data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/waitlists/${params.id}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${waitlist?.title || 'waitlist'}-submissions.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  const filteredSubmissions = submissions.filter(submission =>
    submission.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/embed/${params.id}" width="100%" height="400" frameborder="0"></iframe>`

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading waitlist...</p>
        </div>
      </div>
    )
  }

  if (!waitlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waitlist not found</h2>
          <p className="text-gray-600 mb-4">The waitlist you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold">{waitlist.title}</h1>
                <p className="text-sm text-gray-600">
                  {waitlist.isActive ? 'Active' : 'Inactive'} • Created {new Date(waitlist.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmbedCode(!showEmbedCode)}
              >
                <Code className="w-4 h-4 mr-2" />
                Embed Code
              </Button>
              <Link href={`/dashboard/waitlist/${params.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Link href={`/w/${params.id}`} target="_blank">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View Live
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Embed Code Modal */}
        {showEmbedCode && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Embed Code
              </CardTitle>
              <CardDescription>
                Copy this code to embed your waitlist form on any website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <code className="text-sm text-gray-800 break-all">
                  {embedCode}
                </code>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  The form will automatically match your website's styling
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode)
                    // You could add a toast notification here
                  }}
                >
                  Copy Code
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">
                +{submissions.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.isEmailVerified).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {submissions.length > 0 ? Math.round((submissions.filter(s => s.isEmailVerified).length / submissions.length) * 100) : 0}% verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.reduce((total, s) => total + s.referralCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg {submissions.length > 0 ? (submissions.reduce((total, s) => total + s.referralCount, 0) / submissions.length).toFixed(1) : 0} per user
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>
                  Manage and track your waitlist signups
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching submissions' : 'No submissions yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Share your waitlist link to start collecting signups'
                  }
                </p>
                {!searchTerm && (
                  <Link href={`/w/${params.id}`} target="_blank">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Share className="w-4 h-4 mr-2" />
                      View Waitlist Form
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell className="font-medium">
                        #{submission.position}
                      </TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.isEmailVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.isEmailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {submission.referralCode}
                        </code>
                      </TableCell>
                      <TableCell>{submission.referralCount}</TableCell>
                      <TableCell>
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}