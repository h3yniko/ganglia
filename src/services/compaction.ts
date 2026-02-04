import OpenAI from 'openai'
import { readFile, writeFile } from './storage.js'
import { config } from '../lib/config.js'

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openrouterApiKey
})

const COMPACTION_MODEL = 'anthropic/claude-opus-4' // Best quality for memory merging

// Use LLM to intelligently merge new log entries into memory
async function mergeWithLLM(
  currentMemory: string,
  logContent: string,
  memoryType: string
): Promise<string> {
  const systemPrompt = `You are a memory consolidation assistant. Your job is to merge new log entries into existing memory files.

Rules:
1. Extract facts marked with type prefixes from the log's "Retain" sections:
   - W = World facts (external events, dates)
   - B = Biographical (things learned, built, fixed, mistakes)
   - O = Opinion/preference (include confidence if given, e.g., O(c=0.8))
   - S = Summary/observation
   - F = Forget (remove this fact from memory)

2. Merge intelligently:
   - Update existing facts if new info supersedes them
   - Add new facts in appropriate sections
   - Remove facts marked with F (Forget)
   - Deduplicate similar information
   - Keep the memory concise and well-organized

3. Preserve the existing structure and formatting of the memory file.

4. Add dates to new facts for context (e.g., "(2026-02-03)")

5. If no relevant facts to merge, return the memory unchanged.`

  const userPrompt = `## Current ${memoryType} File:
\`\`\`markdown
${currentMemory}
\`\`\`

## New Log Entry:
\`\`\`markdown
${logContent}
\`\`\`

Merge any relevant facts from the log into the memory file. Return ONLY the updated markdown content, no explanations.`

  try {
    const response = await openai.chat.completions.create({
      model: COMPACTION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.1 // Low temperature for consistent merging
    })

    return response.choices[0]?.message?.content || currentMemory
  } catch (err) {
    console.error('[compaction] LLM merge failed:', err)
    return currentMemory // Return unchanged on error
  }
}

interface Manifest {
  version: number
  coreFiles: string[]
  entityRefs: Record<string, string>
}

// Load manifest to get entity ref mappings
function loadManifest(userId: string): Manifest | null {
  const content = readFile(userId, 'manifest.json')
  if (!content) return null
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

// Determine which memory files a log entry might affect using manifest
function getRelevantMemoryFiles(userId: string, logContent: string): string[] {
  const files = new Set<string>(['MEMORY.md']) // Always check core memory

  const manifest = loadManifest(userId)
  if (!manifest) {
    // Fallback to hardcoded mappings
    if (/@coding|@security/i.test(logContent)) files.add('topics/resources/coding.md')
    if (/@business/i.test(logContent)) files.add('topics/areas/business.md')
    if (/@fitness/i.test(logContent)) files.add('topics/areas/fitness.md')
    if (/@hobbies/i.test(logContent)) files.add('topics/areas/hobbies.md')
    if (/@nick/i.test(logContent)) files.add('USER.md')
    return Array.from(files)
  }

  // Use manifest mappings
  for (const [ref, file] of Object.entries(manifest.entityRefs)) {
    const refPattern = new RegExp(ref.replace('@', '@'), 'i')
    if (refPattern.test(logContent)) {
      files.add(file)
    }
  }

  return Array.from(files)
}

// Check if log has Retain section with content
function hasRetainContent(logContent: string): boolean {
  const retainMatch = logContent.match(/### Retain\n([\s\S]*?)(?=\n###|\n##|$)/)
  if (!retainMatch) return false

  // Check if there are actual entries (lines starting with -)
  const section = retainMatch[1]
  return /^\s*-\s+[WBOSF]/m.test(section)
}

// Compact a log file: use LLM to merge into relevant memory files
export async function compactLog(userId: string, logPath: string): Promise<void> {
  if (!config.openrouterApiKey) {
    console.log('[compaction] Skipped - no OpenRouter API key')
    return
  }

  const logContent = readFile(userId, logPath)
  if (!logContent) return

  // Only compact if there are Retain entries
  if (!hasRetainContent(logContent)) {
    console.log(`[compaction] No Retain entries in ${logPath}`)
    return
  }

  const relevantFiles = getRelevantMemoryFiles(userId, logContent)
  console.log(`[compaction] Processing ${logPath} -> ${relevantFiles.join(', ')}`)

  for (const memoryFile of relevantFiles) {
    const currentContent = readFile(userId, memoryFile)
    if (!currentContent) {
      console.log(`[compaction] Skipping ${memoryFile} - doesn't exist`)
      continue
    }

    const memoryType = memoryFile.replace('.md', '').split('/').pop() || 'Memory'
    const updatedContent = await mergeWithLLM(currentContent, logContent, memoryType)

    // Only write if content actually changed
    if (updatedContent !== currentContent) {
      writeFile(userId, memoryFile, updatedContent)
      console.log(`[compaction] Updated ${memoryFile}`)
    } else {
      console.log(`[compaction] No changes to ${memoryFile}`)
    }
  }
}

// Compact today's log (called after log append)
export function compactTodayLog(userId: string, date?: string): void {
  const today = date || new Date().toISOString().slice(0, 10)
  const logPath = `logs/${today}.md`

  // Run compaction asynchronously to not block the response
  compactLog(userId, logPath).catch((err) => {
    console.error(`[compaction] Failed for ${logPath}:`, err)
  })
}
