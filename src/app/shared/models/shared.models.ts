export type NextEventFn = (event: Event) => void;

export interface ProcessMessage {
  date: string;
  eventType: string;
  error?: string;
}
