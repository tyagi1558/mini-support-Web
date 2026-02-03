interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-50 p-5 text-red-800" role="alert">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none focus:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
