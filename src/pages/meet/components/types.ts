export interface User {
  user: {
    name: string;
    email: string;
    plan: string;
    avatarUrl?: string;
    initialsAvatarUrl?: string;
  };
  meetingsList: Meeting[];
  recordings: any[];
  notes: any[];
}

export interface DbUser {
  user: {
    id: number;
    email: string;
    isActiveHost: boolean;
    maxBookings: number;
    totalHostMinutes: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  };
  bookedRooms: any[];
}


export interface Meeting {
  title: string;
  date: string;
  time: string;
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