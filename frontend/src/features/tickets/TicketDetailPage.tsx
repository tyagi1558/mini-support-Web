import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  fetchTicket,
  fetchComments,
  createComment,
  updateTicket,
} from "@/api/tickets";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { TicketStatus, TicketPriority } from "@/types/ticket";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    ...DATE_FORMAT,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const ticketId = id!;

  const ticketQuery = useQuery(
    ["ticket", ticketId],
    () => fetchTicket(ticketId),
    {
      enabled: !!ticketId,
    },
  );
  const commentsQuery = useQuery(
    ["comments", ticketId],
    () => fetchComments(ticketId),
    { enabled: !!ticketId },
  );

  const updateTicketMutation = useMutation(
    (payload: { status?: TicketStatus; priority?: TicketPriority }) =>
      updateTicket(ticketId, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ticket", ticketId]);
      },
    },
  );

  const createCommentMutation = useMutation(
    () => createComment(ticketId, { authorName, message }),
    {
      onSuccess: () => {
        setMessage("");
        setCommentError(null);
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 3000);
        queryClient.invalidateQueries(["comments", ticketId]);
      },
      onError: (error: unknown) => {
        setCommentError(
          error instanceof Error ? error.message : "Failed to add comment.",
        );
      },
    },
  );

  function handleSubmitComment(event: React.FormEvent) {
    event.preventDefault();
    setCommentError(null);
    if (!authorName.trim() || !message.trim()) {
      setCommentError("Name and message are required.");
      return;
    }
    createCommentMutation.mutate();
  }

  if (!ticketId) {
    return (
      <ErrorMessage message="Invalid ticket ID" onRetry={() => navigate("/")} />
    );
  }

  if (ticketQuery.isLoading || ticketQuery.isError) {
    if (ticketQuery.isError) {
      return (
        <ErrorMessage
          message={
            ticketQuery.error instanceof Error
              ? ticketQuery.error.message
              : "Failed to load ticket"
          }
          onRetry={() => ticketQuery.refetch()}
        />
      );
    }
    return <LoadingSpinner />;
  }

  const ticket = ticketQuery.data!;

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-indigo-600 hover:text-indigo-800 mb-5 inline-block focus:outline-none focus:underline"
      >
        ← Back to tickets
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">
              Created {formatDateTime(ticket.createdAt)}
            </span>
            <span className="text-sm text-gray-500">
              Updated {formatDateTime(ticket.updatedAt)}
            </span>
          </div>
        </div>
        <div className="px-5 py-4 border-b border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
        <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap gap-6 items-center">
          <div>
            <label
              htmlFor="status-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status-select"
              value={ticket.status}
              onChange={(e) =>
                updateTicketMutation.mutate({
                  status: e.target.value as TicketStatus,
                })
              }
              disabled={updateTicketMutation.isLoading}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="priority-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority-select"
              value={ticket.priority}
              onChange={(e) =>
                updateTicketMutation.mutate({
                  priority: e.target.value as TicketPriority,
                })
              }
              disabled={updateTicketMutation.isLoading}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {(updateTicketMutation.isLoading ||
            updateTicketMutation.isSuccess) && (
            <p className="text-sm text-gray-600">
              {updateTicketMutation.isLoading ? "Saving..." : "Saved."}
            </p>
          )}
        </div>
      </div>

      <section className="mt-8" aria-labelledby="comments-heading">
        <h2
          id="comments-heading"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Comments
        </h2>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-6">
          <form onSubmit={handleSubmitComment} className="p-5 space-y-4">
            <div>
              <label
                htmlFor="comment-author"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your name
              </label>
              <input
                id="comment-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Name"
                maxLength={100}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoComplete="name"
              />
            </div>
            <div>
              <label
                htmlFor="comment-message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <textarea
                id="comment-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                maxLength={500}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">{message.length}/500</p>
            </div>
            {commentError && (
              <p className="text-sm text-red-600" role="alert">
                {commentError}
              </p>
            )}
            {commentSuccess && (
              <p className="text-sm text-green-600" role="status">
                Comment posted.
              </p>
            )}
            <button
              type="submit"
              disabled={
                createCommentMutation.isLoading ||
                !authorName.trim() ||
                !message.trim()
              }
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCommentMutation.isLoading ? "Posting..." : "Post comment"}
            </button>
          </form>
        </div>

        {commentsQuery.isLoading ? (
          <LoadingSpinner />
        ) : commentsQuery.isError ? (
          <ErrorMessage
            message={
              commentsQuery.error instanceof Error
                ? commentsQuery.error.message
                : "Failed to load comments"
            }
            onRetry={() => commentsQuery.refetch()}
          />
        ) : commentsQuery.data!.items.length === 0 ? (
          <p className="text-gray-600 text-sm py-2">
            No comments yet. Post one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {commentsQuery.data!.items.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <p className="font-medium text-gray-900">
                  {comment.authorName}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDateTime(comment.createdAt)}
                </p>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {comment.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
