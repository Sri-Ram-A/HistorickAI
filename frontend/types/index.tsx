export interface SignupFormValues {
  email: string
  password: string
  password2: string
  username: string
  first_name: string
  last_name: string
}

export interface LoginFormValues {
  username: string
  password: string
}

export interface AuthResponse {
  access: string
  refresh: string
  // optionally: user: { id: number; email: string }
}
export interface FileT {
  id: string;
  name: string;
  file: string;
  uploaded_at: string; 
}
export interface FolderT {
  id: string;
  name: string;
  parent: string | null;
  children: FolderT[];
  files: FileT[];
  created_at: string; // ISO date string
}

//for app/about
export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}
// for app/quiz
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
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