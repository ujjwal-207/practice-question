export const saveToHistory = (topic: string, response: string) => {
  const history = getHistory();
  const newEntry = {
    id: Date.now().toString(),
    topic,
    response,
    timestamp: new Date().toISOString(),
  };
  history.unshift(newEntry);
  localStorage.setItem("qaHistory", JSON.stringify(history.slice(0, 10)));
};

export const getHistory = (): QAHistory[] => {
  if (typeof window === "undefined") return [];
  const history = localStorage.getItem("qaHistory");
  return history ? JSON.parse(history) : [];
};
