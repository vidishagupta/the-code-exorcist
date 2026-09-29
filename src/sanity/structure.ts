import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('haunting').title('Haunting Incidents'),
      S.documentTypeListItem('workflowState').title('Workflow States'),
    ])