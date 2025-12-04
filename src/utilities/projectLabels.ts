import type { Project } from '@/payload-types'

export function getProjectTypeLabel(projectType: Project['projectType']): string {
  const labels: Record<Project['projectType'], string> = {
    venture: 'Venture Studio',
    agency: 'Agency Work',
  }
  return labels[projectType]
}

export function getProjectStatusLabel(projectStatus: Project['projectStatus']): string {
  const labels: Record<Project['projectStatus'], string> = {
    'active': 'Active',
    'completed': 'Completed',
    'in-development': 'In Development',
    'proof-of-concept': 'Proof of Concept',
  }
  return labels[projectStatus]
}
