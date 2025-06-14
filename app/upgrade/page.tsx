'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Crown, Zap, Shield, Globe, Palette, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // If user is already premium, redirect to dashboard
    if (session?.user?.isPremium) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleUpgrade = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
            name: session?.user?.name,
            email: session?.user?.email,
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
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

       
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}