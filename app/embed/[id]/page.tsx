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

export default function EmbedWaitlistPage() {
  const [waitlist, setWaitlist] = useState<Waitlist | null>(null)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
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
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading...</p>
      </div>
    )
  }

  if (error && !waitlist) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (!waitlist?.isActive) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 text-sm">This waitlist is currently inactive.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      {waitlist.showLogo && (
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold">
              {waitlist.title.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {waitlist.title}
        </h2>
        {waitlist.description && (
          <p className="text-gray-600 text-sm">
            {waitlist.description}
          </p>
        )}
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <Input
            type="email"
            placeholder={waitlist.placeholderText}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Joining...' : waitlist.buttonText}
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              {waitlist.successMessage}
            </h3>
            <p className="text-gray-600 text-sm">
              You're #{position} on the waitlist
            </p>
          </div>
        </div>
      )}

      {waitlist.showSocialProof && !isSubmitted && (
        <div className="mt-6 text-center">
          <div className="flex justify-center -space-x-1 mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border border-white flex items-center justify-center text-white text-xs font-medium"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Join {waitlist.submissionCount || 0}+ others
          </p>
        </div>
      )}

      {!waitlist.whiteLabel && (
        <div className="mt-6 text-center">
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
  )
}