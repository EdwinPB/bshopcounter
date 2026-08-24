export const AVERAGE_SERVICE_TIME_MINUTES = 30;

export function estimateWaitingMinutes(waitingClients: number): number {
  const clients = Math.max(0, Math.floor(waitingClients));
  return clients * AVERAGE_SERVICE_TIME_MINUTES;
}

export function formatWaitTime(minutes: number): string {
  if (minutes <= 0) return "Sin espera";

  const totalMinutes = Math.floor(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  }

  if (mins === 0) {
    return hours === 1 ? "1 hora" : `${hours} horas`;
  }

  if (hours === 1) {
    return `1 hora y ${mins} min`;
  }

  return `${hours} horas y ${mins} min`;
}
