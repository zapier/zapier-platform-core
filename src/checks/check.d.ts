interface Check {
  name: string
  shouldRun: (method: string, bundle?: any) => boolean
  run: (method: string, results: any[]) => string[]
}
