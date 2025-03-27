
export function formatEngineInfo(engineInfo: { displacement: string, cylinders: string, turbo: boolean }): string {
  return `${engineInfo.displacement}L ${engineInfo.cylinders}cyl${engineInfo.turbo ? ' Turbo' : ''}`;
}
