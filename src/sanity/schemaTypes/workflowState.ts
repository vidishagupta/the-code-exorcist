import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workflowState',
  title: 'Workflow State',
  type: 'document',
  fields: [
    defineField({
      name: 'currentStage',
      title: 'Current Stage',
      type: 'string',
      options: {
        list: ['uncontained', 'pending_human_review', 'banished'],
      },
      initialValue: 'uncontained',
    }),
    defineField({
      name: 'history',
      title: 'History Log',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'actor',
              title: 'Actor',
              type: 'string',
            }),
            defineField({
              name: 'action',
              title: 'Action',
              type: 'string',
            }),
            defineField({
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
            }),
            defineField({
              name: 'notes',
              title: 'Notes',
              type: 'text',
            }),
          ],
        },
      ],
    }),
  ],
})