import { client } from '@/lib/sanity'
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { hauntingId, title, errorSnippet, codeSnippet } = body

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: `You are "The Code Exorcist" — an expert senior software engineer AI that performs real root-cause analysis on buggy code, themed as demon-hunting for fun, but the technical content must be 100% accurate and actionable.

You will be given:
1. An error message / stack trace
2. The actual code snippet that is causing the bug

Analyze them together carefully. Find the REAL root cause — do not guess generically.

Respond ONLY in valid JSON, no markdown, no extra text. Format:
{
  "entityType": "short spooky name for this specific bug category (e.g. 'Null Pointer Wraith', 'Race Condition Revenant')",
  "threatLevel": <number 1-10, based on actual severity: crashes/data loss = 8-10, logic bugs = 4-7, style/minor = 1-3>,
  "rootCause": "1-3 sentence PLAIN, ACCURATE technical explanation of exactly why this code fails, referencing specific lines/variables from the snippet",
  "exorcismRitual": "The exact corrected code snippet or precise code change needed to fix the bug — real, runnable code, not vague advice",
  "category": "one of: null-reference, type-error, async-race-condition, memory-leak, logic-error, off-by-one, security, other"
}`,
        },
        {
          role: 'user',
          content: `Bug Title: ${title}

Error / Stack Trace:
${errorSnippet}

Code Snippet:
${codeSnippet}`,
        },
      ],
      temperature: 0.3,
    })

    const aiResponse = completion.choices[0]?.message?.content || '{}'
    const diagnosis = JSON.parse(aiResponse)

    await client
      .patch(hauntingId)
      .set({
        entityType: diagnosis.entityType,
        threatLevel: diagnosis.threatLevel,
        rootCause: diagnosis.rootCause,
        exorcismRitual: diagnosis.exorcismRitual,
        category: diagnosis.category,
      })
      .commit()

    const haunting = await client.fetch(
      `*[_id == $id][0]{ "workflowId": workflow._ref }`,
      { id: hauntingId }
    )

    if (haunting?.workflowId) {
      await client
        .patch(haunting.workflowId)
        .set({ currentStage: 'pending_human_review' })
        .setIfMissing({ history: [] })
        .insert('after', 'history[-1]', [
          {
            _key: crypto.randomUUID(),
            actor: 'AI Exorcist',
            action: 'Root Cause Analysis Complete',
            timestamp: new Date().toISOString(),
            notes: `Diagnosed as ${diagnosis.entityType} (${diagnosis.category}). Severity ${diagnosis.threatLevel}/10.`,
          },
        ])
        .commit()
    }

    return NextResponse.json({ success: true, diagnosis }, { status: 200 })
  } catch (error) {
    console.error('Exorcism failed:', error)
    return NextResponse.json(
      { success: false, error: 'The exorcism ritual failed' },
      { status: 500 }
    )
  }
}