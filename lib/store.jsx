"use client"

/* ------------------------------------------------------------------
   Client-side data store — a browser mock of the 4 MongoDB collections
   (users, tuitions, applications, payments). Every action is async and
   slightly delayed so pages can show realistic loading/pending states,
   and the whole store is persisted to localStorage.
------------------------------------------------------------------ */

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { createInitialState } from "./data/seed"

const STORAGE_KEY = "mentorlagbe:store:v1"

const StoreContext = createContext(null)

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms))
const uid = (prefix) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

const randomId = (prefix) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`

export function StoreProvider({ children }) {
  const [state, setState] = useState(createInitialState)
  const [hydrated, setHydrated] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state

  /* hydrate from localStorage after mount (keeps SSR markup identical) */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        setState((prev) => ({ ...prev, ...saved }))
      }
    } catch {
      /* corrupted storage — fall back to seed */
    }
    setHydrated(true)
  }, [])

  /* persist on every change */
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota exceeded — ignore */
    }
  }, [state, hydrated])

  const patchUser = (userId, patch) =>
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u._id === userId ? { ...u, ...patch } : u)),
    }))

  const actions = {
    /* ------------------------------ auth ------------------------- */
    async signUp({ name, email, password, role }) {
      await delay()
      const cleanEmail = String(email || "")
        .trim()
        .toLowerCase()
      if (
        stateRef.current.users.some((u) => u.email.toLowerCase() === cleanEmail)
      ) {
        return {
          ok: false,
          error: "An account with this email already exists.",
        }
      }
      const user = {
        _id: uid("usr"),
        name: name.trim(),
        email: cleanEmail,
        password,
        image: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=eef2ff,f5f3ff`,
        role,
        phone: "",
        bio: "",
        plan: "free",
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({
        ...s,
        users: [...s.users, user],
        session: { userId: user._id },
      }))
      return { ok: true, user }
    },

    async signIn({ email, password }) {
      await delay()
      const cleanEmail = String(email || "")
        .trim()
        .toLowerCase()
      const user = stateRef.current.users.find(
        (u) => u.email.toLowerCase() === cleanEmail
      )
      if (!user || user.password !== password) {
        return {
          ok: false,
          error: "Invalid email or password. Please try again.",
        }
      }
      setState((s) => ({ ...s, session: { userId: user._id } }))
      return { ok: true, user }
    },

    async signOut() {
      await delay(200)
      setState((s) => ({ ...s, session: null }))
      return { ok: true }
    },

    async updateProfile(patch) {
      await delay()
      const { session, users } = stateRef.current
      if (!session) return { ok: false, error: "You are not signed in." }
      const user = users.find((u) => u._id === session.userId)
      if (!user) return { ok: false, error: "Account not found." }
      if (patch.email && patch.email.toLowerCase() !== user.email) {
        const taken = users.some(
          (u) =>
            u._id !== user._id &&
            u.email.toLowerCase() === patch.email.toLowerCase()
        )
        if (taken) return { ok: false, error: "That email is already in use." }
      }
      patchUser(user._id, { ...patch, email: patch.email?.toLowerCase() })
      return { ok: true }
    },

    /* ---------------------------- tuitions ----------------------- */
    async createTuition(data) {
      await delay(450)
      const { session, users, tuitions } = stateRef.current
      if (!session)
        return { ok: false, error: "You must be signed in as a tutor." }
      const tutor = users.find((u) => u._id === session.userId)
      if (!tutor || tutor.role !== "tutor") {
        return { ok: false, error: "Only tutors can post tuitions." }
      }
      if (tutor.plan !== "pro") {
        const mine = tuitions.filter((t) => t.tutorEmail === tutor.email)
        if (mine.length >= 2) {
          return {
            ok: false,
            error:
              "Free plan limit reached (2 tuitions). Upgrade to Pro for unlimited posts.",
          }
        }
      }
      const tuition = {
        _id: uid("tui"),
        ...data,
        tutorName: tutor.name,
        tutorEmail: tutor.email,
        tutorPlan: tutor.plan,
        approvalStatus: "pending",
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, tuitions: [tuition, ...s.tuitions] }))
      return { ok: true, tuition }
    },

    async updateTuition(id, patch) {
      await delay(400)
      setState((s) => ({
        ...s,
        tuitions: s.tuitions.map((t) =>
          t._id === id ? { ...t, ...patch } : t
        ),
      }))
      return { ok: true }
    },

    async deleteTuition(id) {
      await delay(350)
      setState((s) => ({
        ...s,
        tuitions: s.tuitions.filter((t) => t._id !== id),
        applications: s.applications.filter((a) => a.tuitionId !== id),
      }))
      return { ok: true }
    },

    async toggleTuitionActive(id) {
      await delay(250)
      setState((s) => ({
        ...s,
        tuitions: s.tuitions.map((t) =>
          t._id === id ? { ...t, isActive: !t.isActive } : t
        ),
      }))
      return { ok: true }
    },

    async setTuitionApproval(id, status) {
      await delay(350)
      setState((s) => ({
        ...s,
        tuitions: s.tuitions.map((t) =>
          t._id === id ? { ...t, approvalStatus: status } : t
        ),
      }))
      return { ok: true }
    },

    /* -------------------------- applications -------------------- */
    async applyToTuition(tuitionId, data) {
      await delay(500)
      const { session, users, tuitions, applications } = stateRef.current
      if (!session)
        return { ok: false, error: "Sign in as a student to apply." }
      const student = users.find((u) => u._id === session.userId)
      if (!student || student.role !== "student") {
        return { ok: false, error: "Only students can apply for tuitions." }
      }
      const tuition = tuitions.find((t) => t._id === tuitionId)
      if (!tuition) return { ok: false, error: "Tuition not found." }
      if (
        applications.some(
          (a) => a.tuitionId === tuitionId && a.studentEmail === student.email
        )
      ) {
        return {
          ok: false,
          error: "You have already applied for this tuition.",
        }
      }
      const application = {
        _id: uid("app"),
        tuitionId,
        tuitionTitle: tuition.title,
        subject: tuition.subject,
        monthlyFee: tuition.monthlyFee,
        tutorEmail: tuition.tutorEmail,
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: data.studentPhone || student.phone || "",
        preferredSchedule: data.preferredSchedule || tuition.schedule,
        studentNote: data.studentNote || "",
        status: "pending",
        appliedAt: new Date().toISOString(),
      }
      setState((s) => ({
        ...s,
        applications: [application, ...s.applications],
      }))
      return { ok: true, application }
    },

    async setApplicationStatus(id, status) {
      await delay(350)
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) =>
          a._id === id ? { ...a, status } : a
        ),
      }))
      return { ok: true }
    },

    async cancelApplication(id) {
      await delay(300)
      setState((s) => ({
        ...s,
        applications: s.applications.filter(
          (a) => !(a._id === id && a.status === "pending")
        ),
      }))
      return { ok: true }
    },

    /* --------------------------- bookmarks ----------------------- */
    async toggleBookmark(tuitionId) {
      await delay(150)
      setState((s) => ({
        ...s,
        bookmarks: s.bookmarks.includes(tuitionId)
          ? s.bookmarks.filter((b) => b !== tuitionId)
          : [...s.bookmarks, tuitionId],
      }))
      return { ok: true }
    },

    /* ---------------------- stripe (mocked) ---------------------- */
    async checkout(plan) {
      await delay(900)
      const { session, users } = stateRef.current
      if (!session)
        return { ok: false, error: "Sign in before upgrading your plan." }
      const user = users.find((u) => u._id === session.userId)
      if (!user) return { ok: false, error: "Account not found." }
      if (user.plan === "pro" && plan.audience === user.role) {
        return { ok: false, error: "You are already on a Pro plan." }
      }
      const payment = {
        _id: uid("pay"),
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        planName: plan.name,
        amount: plan.price,
        currency: "USD",
        transactionId: randomId("txn"),
        stripeSessionId: randomId("cs_test"),
        paymentStatus: "paid",
        paidAt: new Date().toISOString(),
      }
      patchUser(user._id, { plan: "pro" })
      setState((s) => ({ ...s, payments: [payment, ...s.payments] }))
      return { ok: true, payment }
    },

    /* ------------------------ admin actions ---------------------- */
    async setUserRole(id, role) {
      await delay(300)
      patchUser(id, { role })
      return { ok: true }
    },

    /* --------------------------- reviews ------------------------- */
    async addReview({ tuitionId, rating, comment }) {
      await delay(400)
      const { session, users, reviews } = stateRef.current
      if (!session) return { ok: false, error: "Sign in to leave a review." }
      const user = users.find((u) => u._id === session.userId)
      const review = {
        _id: uid("rev"),
        tuitionId,
        studentName: user?.name || "Anonymous",
        rating: Number(rating),
        comment,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, reviews: [review, ...s.reviews] }))
      return { ok: true }
    },

    /* ------------------------- demo utility ---------------------- */
    async resetDemo() {
      await delay(400)
      setState((prev) => {
        const fresh = createInitialState()
        /* keep the session alive when the signed-in user exists in the seed */
        const session =
          prev.session && fresh.users.some((u) => u._id === prev.session.userId)
            ? prev.session
            : null
        return { ...fresh, session }
      })
      return { ok: true }
    },
  }

  const currentUser = state.session
    ? state.users.find((u) => u._id === state.session.userId) || null
    : null

  const value = {
    ...state,
    hydrated,
    currentUser,
    actions,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>")
  return ctx
}
