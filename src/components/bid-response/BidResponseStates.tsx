
interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({
  message
}: ErrorStateProps) => (
  <div className="flex-grow flex items-center justify-center p-4">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {message}
      </h2>
    </div>
  </div>
);

export const LoadingState = () => (
  <div className="flex-grow flex items-center justify-center p-4">
    <div className="text-center">
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

interface SubmittedStateProps {
  message?: string;
}

export const SubmittedState = ({
  message = "Your bid has been received. We'll be in touch shortly."
}: SubmittedStateProps) => (
  <div className="px-4 py-8 flex items-center justify-center flex-grow">
    <div className="w-full max-w-lg text-center space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);
