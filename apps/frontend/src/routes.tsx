import { lazyLoad } from '@utils/lazyLoad';
import type { FC } from 'react';
import type { RouteConfig } from './constants/routes';

// Define prop types for components
export interface FileUploadProps {
  onDrop: (files: File[]) => void;
  file?: File | null;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface DadJokeProps {
  className?: string;
}

export interface InterviewChatProps {
  className?: string;
}

// Lazy load main components with default exports
const Dashboard = lazyLoad<InterviewChatProps>(
  () => import('@/components/organisms/InterviewChat/InterviewChat').then(m => ({ default: m.InterviewChat }))
);

const FileUploadComponent = lazyLoad<FileUploadProps>(
  () => import('@/components/molecules/FileUpload/FileUpload').then(m => ({ default: m.FileUpload }))
);

const DadJoke = lazyLoad<DadJokeProps>(
  () => import('@/components/molecules/DadJoke/DadJoke').then(m => ({ default: m.DadJoke }))
);


// Create a wrapper component for the home page
const HomePage: FC = () => {
  const handleFileUpload = () => {
    // Handle file upload logic here
  };

  return (
    <div className="home-page">
      <FileUploadComponent 
        onDrop={handleFileUpload}
        accept={{
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }}
        label="Upload Resume"
        className="mb-4"
      />
      <FileUploadComponent
        onDrop={handleFileUpload}
        accept={{
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }}
        label="Upload Job Description"
      />
    </div>
  );
};

// Main application routes
// eslint-disable-next-line react-refresh/only-export-components
export const ROUTES: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    exact: true,
  },
  {
    path: '/interview',
    component: Dashboard,
    exact: true,
  },
  {
    path: '/joke',
    component: DadJoke,
    exact: true,
  },
];

export default ROUTES;
