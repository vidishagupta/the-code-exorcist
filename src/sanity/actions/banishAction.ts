import { useState } from 'react'
import { useClient } from 'sanity'
import { DocumentActionComponent, DocumentActionProps } from 'sanity'

export const banishAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { draft, published, id, onComplete } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [isBanishing, setIsBanishing] = useState(false)

  const doc = draft || published

  return {
    label: isBanishing ? 'Banishing...' : '💀 BANISH',
    tone: 'critical',
    disabled: isBanishing || !doc,
    onHandle: async () => {
      setIsBanishing(true)
      try {
        const realId = id.replace('drafts.', '')

        await client
          .patch(realId)
          .set({ status: 'banished' })
          .commit({ visibility: 'async' })

        const haunting = await client.fetch(
          `*[_id == $id][0]{ "workflowId": workflow._ref }`,
          { id: realId }
        )

        if (haunting?.workflowId) {
          await client
            .patch(haunting.workflowId)
            .set({ currentStage: 'banished' })
            .setIfMissing({ history: [] })
            .insert('after', 'history[-1]', [
              {
                _key: crypto.randomUUID(),
                actor: 'Grand Inquisitor (You)',
                action: 'Banishment Approved',
                timestamp: new Date().toISOString(),
                notes: 'The entity has been cast out. Case closed.',
              },
            ])
            .commit({ visibility: 'async' })
        }

        onComplete()
      } catch (err) {
        console.error('Banishment failed:', err)
        setIsBanishing(false)
      }
    },
  }
}