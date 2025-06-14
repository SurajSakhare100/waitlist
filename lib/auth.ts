import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from "@/lib/email"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email })
        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in")
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
          isVerified: user.isVerified,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect()
        
        const existingUser = await User.findOne({ email: user.email })
        
        if (!existingUser) {
          // Create new user if doesn't exist
          await User.create({
            name: user.name,
            email: user.email,
            password: "", // No password for Google users
            isPremium: false,
            isVerified: true, // Google users are verified by default
          })
        } else if (!existingUser.isVerified) {
          // If user exists but not verified, mark as verified
          existingUser.isVerified = true
          await existingUser.save()
        }
      } else if (account?.provider === "credentials") {
        // For credentials signup, send verification email
        const verificationToken = generateVerificationToken()
        const verificationTokenExpires = getTokenExpiry()

        await User.findOneAndUpdate(
          { email: user.email },
          {
            verificationToken,
            verificationTokenExpires,
          }
        )

        await sendVerificationEmail(user.email!, verificationToken)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isPremium = user.isPremium
        token.isVerified = user.isVerified
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.isPremium = token.isPremium
        session.user.isVerified = token.isVerified
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} 