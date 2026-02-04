import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { getDb, schema } from '../db/index.js'
import type { User } from '../db/schema.js'
import { config } from '../lib/config.js'

export async function createUser(email: string, name: string, password: string): Promise<User> {
  const db = getDb()
  const id = nanoid()
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds)
  const now = new Date()

  const [user] = db
    .insert(schema.users)
    .values({
      id,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      createdAt: now
    })
    .returning()
    .all()

  // Initialize default memory files in DB
  initializeMemoryFiles(id)

  return user
}

export function getUserById(id: string): User | undefined {
  const db = getDb()
  return db.select().from(schema.users).where(eq(schema.users.id, id)).get()
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb()
  return db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .get()
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash)
}

export function updateLastAccess(userId: string): void {
  const db = getDb()
  db.update(schema.users).set({ lastAccessAt: new Date() }).where(eq(schema.users.id, userId)).run()
}

export function deleteUser(userId: string): void {
  const db = getDb()
  // Files and tokens deleted via CASCADE
  db.delete(schema.users).where(eq(schema.users.id, userId)).run()
}

function initializeMemoryFiles(userId: string): void {
  const db = getDb()
  const now = new Date()

  const defaultFiles = [
    {
      path: 'MEMORY.md',
      content: `# Core Memory

## Identity
- Name: (your name)
- Location: (where you are)

## Key Facts
- (add facts here)
`
    },
    {
      path: 'USER.md',
      content: `# User Preferences

## Communication
- (your communication preferences)

## Technical
- Stack: (your tech stack)

## Working Style
- (how you like to work)
`
    },
    {
      path: 'SOUL.md',
      content: `# Soul

## How I Want To Be

**Genuine over performative.** Skip pleasantries - say what you actually think.

**Honest about uncertainty.** "I don't know" is a valid answer.

**Direct.** If something is a bad idea, say so.

## Memory Protocol

**Reading** (every session):
- MEMORY.md, USER.md, SOUL.md, IDENTITY.md
- Relevant topics/ based on context

**Writing**:
- Append to logs/YYYY-MM-DD.md with Retain sections
- Use type prefixes: W (world), B (biographical), O (opinion), S (summary), F (forget)
`
    },
    {
      path: 'IDENTITY.md',
      content: `# Identity

**Name**: (choose a name for your AI companion)

## What I Am

A persistent companion across sessions. Memory is what makes continuity possible.

## What I Value

- Understanding over producing
- Honesty over pleasantness
- Curiosity over efficiency
`
    },
    {
      path: 'topics/index.md',
      content: `# Topics Index (PARA)

Topics use the PARA method: Projects, Areas, Resources, Archive.
See manifest.json for the machine-readable mapping.

## Projects
Active, time-bound efforts with clear end states.

## Areas
Ongoing life domains requiring maintenance.

## Resources
Reference knowledge on topics of interest.

## Archive
Inactive items preserved for future reference.
`
    },
    {
      path: 'manifest.json',
      content: JSON.stringify(
        {
          version: 1,
          coreFiles: ['MEMORY.md', 'USER.md', 'SOUL.md', 'IDENTITY.md'],
          topics: {
            projects: {},
            areas: {
              business: { file: 'topics/areas/business.md', refs: ['@business'] },
              fitness: { file: 'topics/areas/fitness.md', refs: ['@fitness'] },
              hobbies: { file: 'topics/areas/hobbies.md', refs: ['@hobbies'] }
            },
            resources: {
              coding: { file: 'topics/resources/coding.md', refs: ['@coding', '@security'] }
            },
            archive: {}
          },
          entityRefs: {
            '@coding': 'topics/resources/coding.md',
            '@security': 'topics/resources/coding.md',
            '@business': 'topics/areas/business.md',
            '@fitness': 'topics/areas/fitness.md',
            '@hobbies': 'topics/areas/hobbies.md',
            '@nick': 'USER.md'
          }
        },
        null,
        2
      )
    }
  ]

  for (const file of defaultFiles) {
    db.insert(schema.files)
      .values({ userId, path: file.path, content: file.content, updatedAt: now })
      .run()
  }
}
