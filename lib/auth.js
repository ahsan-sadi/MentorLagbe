import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

/* `role` / `plan` have to be `input: true` so sign-up can record the chosen
   role — but Better Auth's `/update-user` accepts every `input: true` field
   from the *signed-in* user, so anyone could POST `{ role: "admin" }` and
   promote themselves (verified: a student account became admin this way).

   Role and plan only ever change server-side — the admin dashboard's
   `PATCH /users/:id` and the Stripe webhook both write to MongoDB directly,
   never through this endpoint — so reject them outright here. */
const lockPrivilegedFields = () => ({
  id: "lock-privileged-fields",
  hooks: {
    before: [
      {
        matcher: (ctx) => ctx.path === "/update-user",
        handler: createAuthMiddleware(async (ctx) => {
          const body = ctx.body
          if (!body || typeof body !== "object") return
          const blocked = ["role", "plan"].filter((key) => body[key] !== undefined)
          if (blocked.length) {
            throw APIError.from("BAD_REQUEST", {
              message: `${blocked.join(" and ")} cannot be changed from your profile.`,
              code: "PRIVILEGED_FIELD_IMMUTABLE",
            })
          }
        }),
      },
    ],
  },
})

const client = new MongoClient(process.env.MONGO_URI)
const db = client.db("mentor_lagbe_db")

/* Issuer/audience baked into every token. The Express API verifies the same
   two values (see backend-mentorLagbe/middlewares.js) — change them together. */
export const JWT_ISSUER = "mentorlagbe"
export const JWT_AUDIENCE = "mentorlagbe-api"

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  /* JWT plugin — https://better-auth.com/docs/plugins/jwt
     Issues a signed JWT for the current session:
       GET  /api/auth/token        -> { token }      (what the app calls)
       GET  /api/auth/jwks         -> public keys    (what the API verifies with)
     The signing key pair lives in this database's `jwks` collection, so the
     backend reads it straight from MongoDB — no cookie ever has to cross
     origins. The old `jwt: { enabled: true }` block above was not a real
     Better Auth option and was silently ignored. */
  plugins: [
    jwt({
      jwt: {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        expirationTime: "7d",
      },
    }),
    lockPrivilegedFields(),
  ],

  /* Extra columns on `user`. Without this, `role` sent by sign-up is dropped
     by better-auth and useSession() never returns it — so the dashboard
     redirects would have no role to branch on. */
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: true,
        defaultValue: "student",
      },
      plan: {
        type: "string",
        required: false,
        input: true,
        defaultValue: "free",
      },
      phone: { type: "string", required: false, input: true, defaultValue: "" },
      bio: { type: "string", required: false, input: true, defaultValue: "" },
    },
  },
})
