'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Eye, Save, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from 'next/navigation'

export default function EditWaitlistPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url:'',
    placeholderText: 'Enter your email',
    buttonText: 'Join the waitlist',
    successMessage: "Success! You're on the waitlist 🎉",
    showLogo: true,
    logoSize: '1X',
    showSocialProof: true,
    enableReferrals: true,
    whiteLabel: false,
    isActive: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('setup')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchWaitlist()
  }, [params.id])

  const fetchWaitlist = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/waitlists/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(data.waitlist)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/waitlists/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/waitlist/${params.id}`)
      } else {
        setError(data.message || 'Failed to update waitlist')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/waitlists/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError('Failed to delete waitlist')
        setShowDeleteModal(false)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/waitlist/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Waitlist
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold">Edit Waitlist</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete Waitlist</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{formData.title}"? This action cannot be undone and all associated data will be permanently removed.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Waitlist
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the basic details for your waitlist
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Waitlist Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., My Awesome Product"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell people what they're signing up for..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      placeholder="https://habitpulse.xyz/"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                    />
                    
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placeholderText">Email Placeholder Text</Label>
                    <Input
                      id="placeholderText"
                      value={formData.placeholderText}
                      onChange={(e) => handleInputChange('placeholderText', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e) => handleInputChange('buttonText', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="successMessage">Success Message</Label>
                    <Input
                      id="successMessage"
                      value={formData.successMessage}
                      onChange={(e) => handleInputChange('successMessage', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Configure your waitlist settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-sm text-gray-600">Enable or disable your waitlist form</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Logo</Label>
                      <p className="text-sm text-gray-600">Display your brand logo on the form</p>
                    </div>
                    <Switch
                      checked={formData.showLogo}
                      onCheckedChange={(checked) => handleInputChange('showLogo', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Social Proof</Label>
                      <p className="text-sm text-gray-600">Display signup count and user avatars</p>
                    </div>
                    <Switch
                      checked={formData.showSocialProof}
                      onCheckedChange={(checked) => handleInputChange('showSocialProof', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Referrals ⚡</Label>
                      <p className="text-sm text-gray-600">Let users refer friends to move up in line</p>
                    </div>
                    <Switch
                      checked={formData.enableReferrals}
                      onCheckedChange={(checked) => handleInputChange('enableReferrals', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>White Label ⚡</Label>
                      <p className="text-sm text-gray-600">Remove WaitlistBuilder branding</p>
                    </div>
                    <Switch
                      checked={formData.whiteLabel}
                      onCheckedChange={(checked) => handleInputChange('whiteLabel', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your waitlist form will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg">
                  <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
                    {formData.showLogo && (
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">L</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {formData.title || 'Your Waitlist Title'}
                      </h3>
                      {formData.description && (
                        <p className="text-gray-600">{formData.description}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Input
                        placeholder={formData.placeholderText}
                        disabled
                      />
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled
                      >
                        {formData.buttonText}
                      </Button>
                    </div>

                    {formData.showSocialProof && (
                      <div className="mt-6 text-center">
                        <div className="flex justify-center -space-x-2 mb-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                            >
                              {i}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          ⚡ Be the first to join
                        </p>
                      </div>
                    )}

                    {!formData.isActive && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 text-center">
                          ⚠️ This waitlist is currently inactive
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}