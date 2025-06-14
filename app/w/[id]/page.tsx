'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParams } from 'next/navigation'

interface Waitlist {
  _id: string
  title: string
  description: string
  placeholderText: string
  buttonText: string
  successMessage: string
  showLogo: boolean
  showSocialProof: boolean
  enableReferrals: boolean
  whiteLabel: boolean
  isActive: boolean
  submissionCount: number
}

export default function WaitlistFormPage() {
  const [waitlist, setWaitlist] = useState<Waitlist | null>(null)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string>('')
  const [error, setError] = useState('')
  const params = useParams()

  useEffect(() => {
    fetchWaitlist()
  }, [params.id])

  const fetchWaitlist = async () => {
    try {
      const response = await fetch(`/api/public/waitlists/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setWaitlist(data.waitlist)
      } else {
        setError('Waitlist not found')
      }
    } catch (error) {
      setError('Failed to load waitlist')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/public/waitlists/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setPosition(data.position)
        setReferralCode(data.referralCode)
      } else {
        setError(data.message || 'Failed to join waitlist')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !waitlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waitlist not found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!waitlist?.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waitlist is inactive</h2>
          <p className="text-gray-600">This waitlist is currently not accepting signups.</p>
        </div>
      </div>
    )
  }

  const referralUrl = `${window.location.origin}/w/${params.id}?ref=${referralCode}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {waitlist.showLogo && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">
                  {waitlist.title.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {waitlist.title}
            </h1>
            {waitlist.description && (
              <p className="text-gray-600 leading-relaxed">
                {waitlist.description}
              </p>
            )}
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Input
                  type="email"
                  placeholder={waitlist.placeholderText}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-lg"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : waitlist.buttonText}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {waitlist.successMessage}
                </h3>
                <p className="text-gray-600">
                  You're #{position} on the waitlist
                </p>
              </div>

              {waitlist.enableReferrals && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Move up in line! 🚀
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Share your referral link and move up for each friend who joins
                  </p>
                  <div className="flex space-x-2">
                    <Input
                      value={referralUrl}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(referralUrl)
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {waitlist.showSocialProof && !isSubmitted && (
            <div className="mt-8 text-center">
              <div className="flex justify-center -space-x-2 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                ⚡ Join {waitlist.submissionCount || 0}+ others on the waitlist
              </p>
            </div>
          )}

          {!waitlist.whiteLabel && (
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                Powered by{' '}
                <a
                  href="/"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WaitlistBuilder
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}