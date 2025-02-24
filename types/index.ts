export type QAHistory = {
  id: string;
  topic: string;
  response: string;
  timestamp: string;
  userLevel: UserLevel;
};
export type UserLevel = "beginner" | "intermediate" | "expert";
