export type ListaProcesos = Proceso[]

export interface Proceso {
  output?: string
  pid: number
  process?: Process[]
}