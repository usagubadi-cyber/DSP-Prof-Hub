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
  isRegistered: boolean;
}

export interface CurrentMember {
  name: string;
  email: string;
}
