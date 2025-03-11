export type ListaProcesos = Proceso[]

type Code = { [filename: string]: string };

export interface Proceso {
  output?: string
  pid: number
  process?: Process[]
}