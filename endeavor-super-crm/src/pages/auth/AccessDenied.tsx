// Access Denied (403) Page

import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 403 Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--error-light)] flex items-center justify-center">
          <svg className="w-12 h-12 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
          403
        </h1>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Access Denied
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          You do not have permission to access this resource.
          <br />
          This incident has been logged.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary px-6"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary px-6"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
