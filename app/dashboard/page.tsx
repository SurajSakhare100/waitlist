'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, TrendingUp, Mail, Settings, BarChart3, Eye, Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useSession, signOut } from 'next-auth/react'

interface Waitlist {
  _id: string
  title: string
  description: string
  submission: number
  createdAt: string
}

export default function DashboardPage() {
  const [waitlists, setWaitlists] = useState<Waitlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchWaitlists()
    }
  }, [status])

  const fetchWaitlists = async () => {
    try {
      const response = await fetch('/api/waitlists')
      if (response.ok) {
        const data = await response.json()
        setWaitlists(data.waitlists)
      }
    } catch (error) {
      console.error('Error fetching waitlists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWaitlist = () => {
    if (!session?.user?.isPremium && waitlists.length >= 1) {
      toast.error('Free users can create only 1 waitlist. Upgrade to Pro for unlimited waitlists.')
      router.push('/upgrade')
      return
    }
    router.push('/dashboard/create')
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                WaitlistBuilder
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session?.user?.name}</span>
              {!session?.user?.isPremium && (
                <Link href="/upgrade">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Waitlists</h1>
          <Button
            onClick={handleCreateWaitlist}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Create New Waitlist
          </Button>
        </div>

        {waitlists.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">No waitlists yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create your first waitlist to start collecting signups.
                </p>
                <Button
                  onClick={handleCreateWaitlist}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Create Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {waitlists.map((waitlist) => (
              <Card key={waitlist._id}>
                <CardHeader>
                  <CardTitle>{waitlist.title}</CardTitle>
                  <CardDescription>{waitlist.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {waitlist.submission} signups
                    </div>
                    <Link href={`/dashboard/waitlist/${waitlist._id}/edit`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}