import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const client = new MongoClient(process.env.MONGO_URI)
const db = client.db("mentor_lagbe_db")

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

  /* JWT configuration - tokens issued on sign-in, validated via Authorization header */
  jwt: {
    enabled: true,
    secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
    expiresIn: "7d",
    issuer: "mentorlagbe",
    audience: "mentorlagbe-api",
  },
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
