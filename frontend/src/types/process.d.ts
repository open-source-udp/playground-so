export type ListaProcesos = Proceso[]

export type Code = string | null

export interface Proceso {
  output?: string
  pid: number
  process?: Process[]
}