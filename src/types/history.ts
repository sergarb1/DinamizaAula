export interface Participation {
  studentId: string
  timestamp: number
  strategy: string
  mechanic: string
}

export interface StudentStats {
  totalParticipations: number
  lastParticipation: number | null
  consecutiveParticipations: number
  timesAvoided: number
}
