import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcrypt";
import { db } from "./db.server"

// login user
export async function login({ username, password }) {
  const user = await db.user.findUnique({
    where: {
      username
    },
  })

  if (!user) return

  // Check password
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)

  if (!isCorrectPassword) return

  return user
}

// Register new user
export async function register({ username, password }) {
  const passwordHash = await bcrypt.hash(password, 10)
  return db.user.create({
    data: {
      username,
      passwordHash
    }
  })
}

// Get session secrete
const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) {
  throw new Error("No Session Secret")
}

//  create session storage
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "invoice_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
    httpOnly: true
  }
})

// Create session
export async function createUserSession(userId, redirectTo) {
  const session = await getSession()
  session.set("userId", userId)

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
}

// Get user session
export function getUserSession(request) {
  return getSession(request.headers.get("Cookie"))
}

// Get logged in user
export async function getUser(request) {
  const session = await getUserSession(request)
  const userId = session.get("userId")

  if (!userId || typeof userId !== "string") return

  try {
    const user = await db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user
  } catch (error) {
    return
  }
}

// Logout user and destroy session
export async function logout(request) {
  const session = await getSession(request.headers.get("Cookie"))

  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  })
}

export { getSession, commitSession, destroySession };
