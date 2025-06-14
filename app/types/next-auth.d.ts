import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    isPremium: boolean
    isVerified: boolean
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      isPremium: boolean
      isVerified: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isPremium: boolean
    isVerified: boolean
  }
} 