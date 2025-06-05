import { type FC } from 'react';

interface LoadingProps {
    /** The message to display below the spinner */
    message?: string;
    /** Whether to center the loading spinner in the full viewport */
    fullPage?: boolean;
    /** The size of the spinner: 'small' | 'medium' | 'large' */
    size?: 'small' | 'medium' | 'large';
    /** Additional CSS classes to apply to the container */
    className?: string;
}

const LoadingSpinner: FC<LoadingProps> = ({
    message = "Loading...",
    fullPage = false,
    size = "medium",
    className = "",
}) => {
    // Map sizes to Tailwind classes
    const sizeClasses = {
        small: "w-4 h-4 border-2",
        medium: "w-8 h-8 border-3",
        large: "w-12 h-12 border-4",
    };

    const containerClasses = fullPage
        ? "flex min-h-screen items-center justify-center"
        : "flex items-center justify-center";

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="text-center">
                <div
                    className={`inline-block animate-spin rounded-full border-solid border-indigo-600 border-r-transparent ${sizeClasses[size]}`}
                    role="status"
                    aria-label="loading"
                />
                {message && (
                    <p className="mt-2 text-gray-600">{message}</p>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;