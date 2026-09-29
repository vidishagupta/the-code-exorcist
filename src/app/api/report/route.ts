import { client } from '@/lib/sanity'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, errorSnippet, codeSnippet, reportedBy } = body

    // Step 1: Pehle workflowState document banao
    const workflow = await client.create({
      _type: 'workflowState',
      currentStage: 'uncontained',
      history: [
        {
          _key: crypto.randomUUID(),
          actor: reportedBy || 'Anonymous Coder',
          action: 'Haunting Reported',
          timestamp: new Date().toISOString(),
          notes: 'Fresh demonic activity detected.',
        },
      ],
    })

    // Step 2: Haunting document banao, workflow se link karke
    const haunting = await client.create({
      _type: 'haunting',
      title,
      errorSnippet,
      codeSnippet,
      reportedBy: reportedBy || 'Anonymous Coder',
      workflow: {
        _type: 'reference',
        _ref: workflow._id,
      },
    })

    // Step 3: AI Exorcist ko trigger karo (background me, response ka wait nahi karna)
    console.log('Triggering exorcist for haunting:', haunting._id)

    fetch(`${req.nextUrl.origin}/api/exorcist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hauntingId: haunting._id,
        title,
        errorSnippet,
        codeSnippet,
      }),
    })
      .then((res) => console.log('Exorcist trigger response status:', res.status))
      .catch((err) => console.error('Failed to trigger exorcist:', err))

    return NextResponse.json({ success: true, id: haunting._id }, { status: 201 })
  } catch (error) {
    console.error('Report submission failed:', error)
    return NextResponse.json({ success: false, error: 'Submission failed' }, { status: 500 })
  }
}