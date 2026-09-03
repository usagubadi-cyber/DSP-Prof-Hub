export interface PublicEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  major: string | null;
  capacity: number | null;
  signupCount: number;
}
