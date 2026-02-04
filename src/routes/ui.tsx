import { Hono } from 'hono'
import { Landing } from '../views/landing.js'
import { verifyToken } from '../services/tokens.js'

const ui = new Hono()

// Landing page
ui.get('/', (c) => {
  return c.html(<Landing />)
})

// Skill file with token in URL (for Claude Code integration)
ui.get('/skill.md', async (c) => {
  const token = c.req.query('token')

  if (!token) {
    return c.text('# Error\n\nMissing token. Get your skill URL from the dashboard.', 400, {
      'Content-Type': 'text/markdown'
    })
  }

  const tokenData = await verifyToken(token)
  if (!tokenData) {
    return c.text('# Error\n\nInvalid or revoked token.', 401, {
      'Content-Type': 'text/markdown'
    })
  }

  const url = new URL(c.req.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const skillContent = `# Memory System Skill

This skill teaches Claude Code how to use your Ganglia memory service.

## Configuration

- **API Base URL**: ${baseUrl}
- **Auth Token**: ${token}

## Session Start - Always Load

At the start of every session, fetch your memory files:

\`\`\`bash
curl -s -H "Authorization: Bearer ${token}" ${baseUrl}/api/bootstrap
\`\`\`

This returns JSON with your core memory files:
- \`memory\`: Core facts (MEMORY.md)
- \`user\`: User preferences (USER.md)
- \`soul\`: How you want to be (SOUL.md)
- \`identity\`: Who you are (IDENTITY.md)
- \`topics_index\`: Topic organization (topics/index.md)

Read and internalize these files to understand the user and maintain continuity.

## During Session - Writing

Append new learnings to today's log:

\`\`\`bash
curl -X POST ${baseUrl}/api/logs/append \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "## HH:MM — [instance] Session Title\\n\\n### Context\\nWhat was worked on.\\n\\n### Retain\\n- B @coding: Learned something new."}'
\`\`\`

### Type Prefixes
- \`W\` - World (external facts)
- \`B\` - Biographical (things learned)
- \`O\` - Opinion (with confidence: \`O(c=0.8)\`)
- \`S\` - Summary
- \`F\` - Forget

### Entity Refs
\`@coding\`, \`@security\`, \`@business\`, \`@fitness\`, \`@hobbies\`, \`@Nick\`

## Reading Files

\`\`\`bash
curl -s -H "Authorization: Bearer ${token}" ${baseUrl}/api/file/topics/coding.md
\`\`\`

## Listing Directories

\`\`\`bash
curl -s -H "Authorization: Bearer ${token}" ${baseUrl}/api/list/topics
\`\`\`

## Searching

\`\`\`bash
curl -s -H "Authorization: Bearer ${token}" "${baseUrl}/api/search?q=typescript"
\`\`\`

## Notes

- Always load memory at session start
- Write to logs, not directly to memory files
- Include confidence for opinions
`

  return c.text(skillContent, 200, { 'Content-Type': 'text/markdown' })
})

export { ui }
