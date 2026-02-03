import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { createTicket } from "@/api/tickets";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { TicketPriority } from "@/types/ticket";

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const TITLE_MIN = 5;
const TITLE_MAX = 80;
const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 2000;

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const createMutation = useMutation(() =>
    createTicket({
      title: title.trim(),
      description: description.trim(),
      priority,
    }),
  );

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const t = title.trim();
    const d = description.trim();
    if (t.length < TITLE_MIN) {
      errors.title = `Title must be at least ${TITLE_MIN} characters.`;
    } else if (t.length > TITLE_MAX) {
      errors.title = `Title must be at most ${TITLE_MAX} characters.`;
    }
    if (d.length < DESCRIPTION_MIN) {
      errors.description = `Description must be at least ${DESCRIPTION_MIN} characters.`;
    } else if (d.length > DESCRIPTION_MAX) {
      errors.description = `Description must be at most ${DESCRIPTION_MAX} characters.`;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    createMutation.mutate(undefined, {
      onSuccess: (data) => {
        navigate(`/tickets/${data.id}`);
      },
      onError: (error: unknown) => {
        setValidationErrors((prev) => ({
          ...prev,
          submit:
            error instanceof Error ? error.message : "Failed to create ticket.",
        }));
      },
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create ticket</h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="ticket-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="ticket-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setValidationErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="Brief title for the issue"
            minLength={TITLE_MIN}
            maxLength={TITLE_MAX}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-invalid={!!validationErrors.title}
            aria-describedby={
              validationErrors.title ? "title-error" : undefined
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            {title.trim().length}/{TITLE_MAX} characters
          </p>
          {validationErrors.title && (
            <p
              id="title-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {validationErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ticket-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="ticket-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setValidationErrors((prev) => ({ ...prev, description: "" }));
            }}
            placeholder="Describe the issue in detail..."
            rows={6}
            minLength={DESCRIPTION_MIN}
            maxLength={DESCRIPTION_MAX}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-invalid={!!validationErrors.description}
            aria-describedby={
              validationErrors.description ? "description-error" : undefined
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            {description.trim().length}/{DESCRIPTION_MAX} characters
          </p>
          {validationErrors.description && (
            <p
              id="description-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {validationErrors.description}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ticket-priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="ticket-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {validationErrors.submit && (
          <ErrorMessage message={validationErrors.submit} />
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isLoading ? "Creating…" : "Create ticket"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
