export type NextEventFn = (event: Event) => void;

export interface ProcessMessage {
  date: string | Date;
  eventType: string;
  error?: string;
}
