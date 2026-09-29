import { useState } from 'react'
import { useClient } from 'sanity'
import { DocumentActionComponent, DocumentActionProps } from 'sanity'

export const rejectAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { draft, published, id, onComplete } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [isRejecting, setIsRejecting] = useState(false)

  const doc = draft || published

  return {
    label: isRejecting ? 'Sending back...' : '🔄 Send Back for Re-analysis',
    tone: 'caution',
    disabled: isRejecting || !doc,
    onHandle: async () => {
      setIsRejecting(true)
      try {
        const realId = id.replace('drafts.', '')

        const haunting = await client.fetch(
          `*[_id == $id][0]{ "workflowId": workflow._ref }`,
          { id: realId }
        )

        if (haunting?.workflowId) {
          await client
            .patch(haunting.workflowId)
            .set({ currentStage: 'uncontained' })
            .setIfMissing({ history: [] })
            .insert('after', 'history[-1]', [
              {
                _key: crypto.randomUUID(),
                actor: 'Grand Inquisitor (You)',
                action: 'Diagnosis Rejected',
                timestamp: new Date().toISOString(),
                notes: 'Human reviewer was not satisfied. Sent back for re-analysis.',
              },
            ])
            .commit({ visibility: 'async' })
        }

        onComplete()
      } catch (err) {
        console.error('Rejection failed:', err)
        setIsRejecting(false)
      }
    },
  }
}