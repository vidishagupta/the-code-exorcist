import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'haunting',
  title: 'Haunting Incident',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Incident Title',
      type: 'string',
    }),
    defineField({
      name: 'errorSnippet',
      title: 'Error / Stack Trace',
      type: 'text',
    }),
    defineField({
      name: 'codeSnippet',
      title: 'Code Snippet (the buggy code)',
      type: 'text',
      rows: 8,
    }),
    defineField({
      name: 'reportedBy',
      title: 'Reported By',
      type: 'string',
    }),
    defineField({
      name: 'entityType',
      title: 'Entity Type',
      type: 'string',
    }),
    defineField({
      name: 'threatLevel',
      title: 'Threat Level',
      type: 'number',
    }),
    defineField({
      name: 'rootCause',
      title: 'Root Cause',
      type: 'text',
    }),
    defineField({
      name: 'exorcismRitual',
      title: 'Exorcism Ritual (the fix)',
      type: 'text',
    }),
    defineField({
      name: 'category',
      title: 'Bug Category',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['uncontained', 'banished'],
      },
      initialValue: 'uncontained',
    }),
    defineField({
      name: 'workflow',
      title: 'Workflow',
      type: 'reference',
      to: [{ type: 'workflowState' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      threatLevel: 'threatLevel',
    },
    prepare({ title, subtitle, threatLevel }) {
      return {
        title: title,
        subtitle: `${subtitle || 'uncontained'}${threatLevel ? ` · Threat: ${threatLevel}/10` : ''}`,
      }
    },
  },
})