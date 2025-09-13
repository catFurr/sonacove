export interface User {
  user: {
    name: string;
    email: string;
    plan: string;
    avatarUrl?: string;
    initialsAvatarUrl?: string;
  };
  meetingsList: any[];
  recordings: any[];
  notes: any[];
}

export interface Meeting {
  date: string;
  time: string;
  title: string;
  status: string;
}

export interface Recording {
  date: string;
  duration: string;
  title: string;
}

export interface Note {
  date: string;
  title: string;
  content: string;
}