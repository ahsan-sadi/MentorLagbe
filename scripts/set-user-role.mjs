/* Set (or list) the `role` on Better Auth user records in MongoDB.

   Usage:
     node scripts/set-user-role.mjs                 # list users + roles
     node scripts/set-user-role.mjs <email> <role>   # role: student | tutor | admin
*/
import fs from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(new URL("../package.json", import.meta.url))
const envPath = new URL("../.env", import.meta.url)
const env = fs.readFileSync(envPath, "utf8")
const pick = (k) => (env.match(new RegExp(`^${k}\\s*=\\s*(.*)$`, "m")) || [])[1]?.trim()

const uri = (pick("MONGO_URI") || "").replace("${DB_PASS}", pick("DB_PASS"))
if (!uri) {
  console.error("MONGO_URI missing from .env")
  process.exit(1)
}

const ROLES = ["student", "tutor", "admin"]
const [email, role] = process.argv.slice(2)

const { MongoClient } = require("mongodb")
const client = new MongoClient(uri)
await client.connect()
const db = client.db("mentor_lagbe_db")

try {
  if (!email && !role) {
    const users = await db
      .collection("user")
      .find({}, { projection: { email: 1, name: 1, role: 1, plan: 1 } })
      .toArray()
    for (const u of users) console.log(`${u.email} → ${u.role ?? "(no role)"} · ${u.plan ?? "free"}`)
    console.log(`\n${await db.collection("session").countDocuments()} active session(s)`)
  } else {
    if (!email || !ROLES.includes(role)) {
      console.error(`Usage: node scripts/set-user-role.mjs <email> <${ROLES.join("|")}>`)
      process.exit(1)
    }
    const res = await db.collection("user").updateOne({ email: email.toLowerCase() }, { $set: { role } })
    if (!res.matchedCount) {
      console.error(`No user with email ${email}`)
      process.exit(1)
    }
    /* Sessions only store the userId — /get-session re-reads the user, so the
       new role applies immediately without signing anyone out. */
    console.log(`${email} → role "${role}"`)
  }
} finally {
  await client.close()
}
