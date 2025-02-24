import { QAHistory, UserLevel } from "../types";
export const saveToHistory = (
  topic: string,
  response: string,
  userLevel: UserLevel
) => {
  const history = getHistory();
  const newEntry = {
    id: Date.now().toString(),
    topic,
    response,
    timestamp: new Date().toISOString(),
    userLevel,
  };
  history.unshift(newEntry);
  localStorage.setItem("qaHistory", JSON.stringify(history.slice(0, 10)));
};

export const getHistory = (): QAHistory[] => {
  if (typeof window === "undefined") return [];
  const history = localStorage.getItem("qaHistory");
  return history ? JSON.parse(history) : [];
};
