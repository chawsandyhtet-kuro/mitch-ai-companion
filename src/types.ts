export type NavTab = "home" | "chat" | "why" | "about";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  boundaryTriggered?: boolean;
  timestamp: string;
}
