//for app/about
export interface TimelineEntry {
    title: string;
    content: React.ReactNode;
  }
// for app/quiz
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}
// for components/chat-message.tsx
export interface ChatMessageProps {
  message: string
  isUser: boolean
}
// for components/custom-sidebar.tsx
export interface SidebarLinkProps {
  link: {
    label: string;
    icon: React.ReactNode;
    href: string;  // Now accepts href for navigation
    onClick?: () => void;
  };
  isCollapsed?: boolean;
}