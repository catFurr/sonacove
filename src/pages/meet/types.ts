/**
 * Represents the comprehensive user object used within the UserCard component.
 */
export interface User {
  user: {
    /** The user's full name. */
    name: string;

    /** The user's email address. */
    email: string;

    /** The user's subscription plan status (e.g., 'trialing', 'active'). */
    plan: string;

    /** URL for the user's primary avatar image. */
    avatarUrl?: string;

    /** URL for a generated initials-based avatar as a fallback. */
    initialsAvatarUrl?: string;
  };

  /** A list of meetings formatted for display. */
  meetingsList: Meeting[];

  /** A list of meeting recordings. Currently unused. */
  recordings: any[];

  /** A list of user notes. Currently unused. */
  notes: any[];
}

/**
 * Represents the raw user data structure as returned from the application's database.
 */
export interface DbUser {
  user: {
    /** The ID of the user. */
    id: number;

    /** The user's email address. */
    email: string;

    /** A boolean indicating if the user has an active host status. */
    isActiveHost: boolean;

    /** The maximum number of meetings a user can book. */
    maxBookings: number;

    /** The total number of minutes the user has hosted meetings. */
    totalHostMinutes: number;

    /** ISO 8601 date string of when the user was created. */
    createdAt: string;

    /** ISO 8601 date string of the last time the user's record was updated. */
    updatedAt: string;
  };

  /** A list of rooms the user has booked. */
  bookedRooms: any[];
}

/**
 * Represents the user object tailored for use within the main application components.
 * It combines data from the OIDC profile and the database.
 */
export interface AppUser {
  /** The user's full name. */
  name: string;

  /** The user's email address. */
  email: string;

  /** The user's subscription plan status. */
  plan: string;

  /** The final URL to be used for the user's avatar. */
  avatarUrl: string;

  /** The total number of minutes the user has used/hosted. */
  minutesUsed: number;

  /** The OIDC access token for the current session. */
  token: string;
}

/**
 * Represents the structure of a single meeting object stored in the browser's localStorage.
 */
export interface LocalStorageMeeting {
  /** The full URL of the conference. The meeting name is extracted from this. */
  conference: string;

  /** A Unix timestamp (in milliseconds) of when the meeting took place. */
  date: number;

  /** The duration of the meeting in milliseconds (optional). */
  duration?: number;
}

/**
 * Represents a meeting object that has been transformed and is ready for display in the UI.
 */
export interface Meeting {
  /** The name of the meeting room. */
  title: string;

  /** The formatted date string (e.g., "September 20, 2025"). */
  date: string;

  /** The formatted time string (e.g., "3:45 PM"). */
  time: string;

  /** The status of the meeting, either 'Upcoming' or 'Past'. */
  status: string;
}

/**
 * Represents a meeting recording. Currently unused.
 */
export interface Recording {
  date: string;
  duration: string;
  title: string;
}

/**
 * Represents a user-created note. Currently unused.
 */
export interface Note {
  date: string;
  title: string;
  content: string;
}
