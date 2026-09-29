import { type SchemaTypeDefinition } from 'sanity'
import  hauntingType from './haunting'
import  workflowStateType from './workflowState'

export const schema: { types: SchemaTypeDefinition[] } =
 {
  types: [hauntingType, workflowStateType],
}