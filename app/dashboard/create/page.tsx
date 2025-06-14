'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Eye, Code, Palette } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'

export default function CreateWaitlistPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    placeholderText: 'Enter your email',
    buttonText: 'Join the waitlist',
    successMessage: "Success! You're on the waitlist 🎉",
    showLogo: true,
    logoSize: '1X',
    showSocialProof: true,
    enableReferrals: true,
    whiteLabel: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('setup')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/waitlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/waitlist/${data.waitlist._id}`)
      } else {
        setError(data.message || 'Failed to create waitlist')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
              <h1 className="text-lg font-semibold">Create New Waitlist</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('setup')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'setup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Palette className="w-4 h-4 mr-2" />
                Setup
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'design'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Design
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {activeTab === 'setup' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Set up the basic details for your waitlist
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
              )}

              {activeTab === 'design' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Design & Features</CardTitle>
                    <CardDescription>
                      Customize the appearance and functionality
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Waitlist'}
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