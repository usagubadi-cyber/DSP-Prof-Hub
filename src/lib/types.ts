export interface PublicEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  capacity: number | null;
  signupCount: number;
}
