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
}

export interface FileT {
  id: string;
  name: string;
  file?: string | null;
  uploaded_at?: string;
  folder: string;
  folder_name?: string;
  processed?: boolean;
}

export interface FolderT {
  id: string;
  name: string;
  parent: string | null;
  path: string;
  is_root: boolean;
  created_at: string;
  updated_at?: string;
}

export type FolderNode = FolderT & {
  children: FolderNode[];
  files: FileT[];
};
//for app/about
export interface TimelineEntry {
  date:string;
  title: string;
  heading: string;
  description: string;
  image_source: string;
  alternative: string;
}

export interface TimelineOutput {
  title: string;
  events: TimelineEntry[];
}
export interface TimelineUIItem {
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