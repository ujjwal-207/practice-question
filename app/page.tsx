"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Trash2, History } from "lucide-react";

import { QAHistory, UserLevel } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getHistory, saveToHistory } from "@/lib/localstorage";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<QAHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel>("intermediate");

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const generateContent = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userLevel }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream not available");

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        fullResponse += text;
        setResponse(fullResponse);
      }

      // Save to history after successful generation
      saveToHistory(topic, fullResponse, userLevel);
      setHistory(getHistory());
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("qaHistory");
    setHistory([]);
  };

  const loadFromHistory = (entry: QAHistory) => {
    setTopic(entry.topic);
    setResponse(entry.response);
    if (entry.userLevel) {
      setUserLevel(entry.userLevel);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Practise Questions</h1>
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4 mr-2" />
                {showHistory ? "Hide History" : "Show History"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter a topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && generateContent()}
                />
                <Button
                  onClick={generateContent}
                  disabled={isLoading || !topic.trim()}
                  className="w-32"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">
                  Select your expertise level:
                </h3>
                <RadioGroup
                  value={userLevel}
                  onValueChange={(value) => setUserLevel(value as UserLevel)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expert" id="expert" />
                    <Label htmlFor="expert">Expert</Label>
                  </div>
                </RadioGroup>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {response && (
                <div className="mt-4 space-y-4">
                  <div className="p-6 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {response}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showHistory && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">History</h2>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearHistory}
                  disabled={history.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => loadFromHistory(entry)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{entry.topic}</h3>
                          {entry.userLevel && (
                            <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                              {entry.userLevel}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
