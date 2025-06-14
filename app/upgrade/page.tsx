'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Crown, Zap, Shield, Globe, Palette, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // If user is already premium, redirect to dashboard
        if (data.user.isPremium) {
          router.push('/dashboard')
        }
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleUpgrade = async () => {
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: 100, // $9 in cents
          currency: 'INR',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Initialize Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'WaitlistBuilder',
          description: 'Pro Plan - Lifetime Access',
          order_id: data.orderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyResponse.ok) {
              // Payment successful, redirect to dashboard
              router.push('/dashboard?upgraded=true')
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#9333ea',
          },
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      } else {
        alert('Failed to create payment order. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
              <h1 className="text-lg font-semibold">Upgrade to Pro</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock the Full Power of WaitlistBuilder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get unlimited waitlists, advanced features, and premium support with our Pro plan
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-2xl mx-auto border-2 border-purple-200 shadow-xl mb-12">
          <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-6 h-6" />
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
            </div>
            <div className="text-5xl font-bold mb-2">$9</div>
            <CardDescription className="text-purple-100 text-lg">
              One-time payment • Lifetime access
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Unlimited Waitlists</p>
                    <p className="text-sm text-gray-600">Create as many forms as you need</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Unlimited Signups</p>
                    <p className="text-sm text-gray-600">No limits on submissions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Advanced Customization</p>
                    <p className="text-sm text-gray-600">Full design control</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Referral System</p>
                    <p className="text-sm text-gray-600">Viral growth features</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Custom Domains</p>
                    <p className="text-sm text-gray-600">Use your own domain</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">White Label Option</p>
                    <p className="text-sm text-gray-600">Remove our branding</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Advanced Analytics</p>
                    <p className="text-sm text-gray-600">Detailed insights</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Priority Support</p>
                    <p className="text-sm text-gray-600">Get help when you need it</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? 'Processing...' : 'Upgrade to Pro - $9'}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                🔒 Secure payment powered by Razorpay
              </p>
              <p className="text-xs text-gray-500 mt-2">
                One-time payment • No recurring charges • 30-day money-back guarantee
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Unlimited Everything</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create unlimited waitlists and collect unlimited signups without any restrictions
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Advanced Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Full control over design, branding, and user experience with white-label options
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Premium Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Detailed insights, conversion tracking, and growth analytics to optimize your campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Is this really a one-time payment?</h4>
              <p className="text-gray-600">
                Yes! Pay once and get lifetime access to all Pro features. No monthly or yearly subscriptions.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What happens to my existing waitlists?</h4>
              <p className="text-gray-600">
                All your existing waitlists will remain active and you'll immediately get access to Pro features for all of them.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I use my own domain?</h4>
              <p className="text-gray-600">
                Yes! Pro users can use custom domains for their waitlist forms and get a completely branded experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}