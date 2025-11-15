"use client"
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getMessaging } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBl6NLfJ_PKmbL0nrbuPeHg3gsCvZeLAvw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rupantra-ai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rupantra-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rupantra-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "717770940130",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:717770940130:web:e918e9e148560f10c3c8bb",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZBL177LFYH",
}

const hasConfig = Object.values(firebaseConfig).every(Boolean)
let app: any = null
if (hasConfig && typeof window !== 'undefined') {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
}

export const auth = app ? getAuth(app) : ({} as any)
export const messaging = app && typeof window !== 'undefined' ? getMessaging(app) : ({} as any)
export default app

