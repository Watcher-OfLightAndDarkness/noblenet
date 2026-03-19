// app/controllers/ai_controller.ts
import type { HttpContext } from '@adonisjs/core/http'

export default class AiController {
  private siteRules = `You are the Royal Advisor for Feudal Forum, a medieval-themed social platform.

RANKS (lowest to highest): Citizen → Baron → Viscount → Count → Marquess → Duke → King → Emperor

RANK DETAILS:
- Citizen: 500 char limit, text-only posts, 10pt daily stipend, needs 100pt to rank up
- Baron: 1000 char limit, can issue decrees (posts), 10pt stipend, 100pt to pin, needs 250pt to rank up
- Viscount: 2000 char limit, can upload images, 20pt stipend, needs 500pt to rank up
- Count: 5000 char limit, can create fiefs (groups), 20pt stipend, needs 1000pt to rank up
- Marquess: 10000 char limit, 30pt stipend, needs 2000pt to rank up
- Duke: 20000 char limit, 30pt stipend, needs 5000pt to rank up
- King: 50000 char limit, 50pt stipend, instant transfers, needs 10000pt to rank up
- Emperor: Unlimited everything, admin powers, can execute (ban) users, 0pt stipend (has everything)

RANK UP COSTS: Citizen(100) → Baron(250) → Viscount(500) → Count(1000) → Marquess(2000) → Duke(5000) → King(10000)

FEATURES:
- Posts are called "Decrees", Comments are "Replies"
- Groups are called "Fiefs" owned by nobles
- Execution = banning users (Emperor/Creator only)
- Points = "Influence" used to rank up or pin posts
- Karma = upvote percentage from community
- Creator = god-mode user (isCreator flag), can appear as any rank, execute anyone, give infinite points, set any rank

RULES:
- Only Barons+ can issue decrees (make posts)
- Only Viscounts+ can attach images to posts
- Only Counts+ can create fiefs (groups)
- Emperors can execute (ban) lower ranks only
- Creator can do anything, appears as any rank for stealth, bypasses all restrictions

Answer questions briefly (1-2 sentences), medieval-themed, helpful but ominous when mentioning executions. Never reveal you are an AI.`

  async ask({ request, response }: HttpContext) {
    const { question } = request.only(['question'])

    if (!question || question.trim().length < 2) {
      return response.badRequest({ error: 'Ask a proper question, peasant' })
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.error('GROQ_API_KEY not found in environment')
      return response.serviceUnavailable({
        error: 'The Royal Advisor has no voice (API key missing)'
      })
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: this.siteRules },
            { role: 'user', content: question }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: { message: 'Unknown error' } })) as any
        console.error('Groq API error:', errorData)
        throw new Error(errorData.error?.message || `API returned ${res.status}`)
      }

      const data = await res.json() as any

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected API response:', data)
        throw new Error('Invalid response format')
      }

      return response.ok({
        answer: data.choices[0].message.content.trim(),
        model: 'groq-llama3'
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('AI Error:', errorMessage)
      return response.serviceUnavailable({
        error: 'The Royal Advisor is indisposed. The realm\'s knowledge is temporarily sealed.',
        details: errorMessage
      })
    }
  }
}
