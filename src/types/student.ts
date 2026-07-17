export interface Student {
  id: string
  name: string
  surname: string
  color: string
  group: string
  active: boolean
}

export interface StudentData {
  course: string
  students: Student[]
  challenges?: string[]
}
