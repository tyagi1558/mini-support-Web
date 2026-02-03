import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { fetchTickets, type ListTicketsParams } from "@/api/tickets";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { TicketStatus, TicketPriority } from "@/types/ticket";

const STATUS_OPTIONS: { value: "" | TicketStatus; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const PRIORITY_OPTIONS: { value: "" | TicketPriority; label: string }[] = [
  { value: "", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest first" },
  { value: "createdAt_asc", label: "Oldest first" },
];

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, DATE_FORMAT);
}

const BADGE_BASE =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none";

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    OPEN: "bg-amber-100 text-amber-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
  };
  const labels: Record<TicketStatus, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    RESOLVED: "Resolved",
  };
  return (
    <span className={`${BADGE_BASE} ${styles[status]}`}>{labels[status]}</span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, string> = {
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
  };
  const labels: Record<TicketPriority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  };
  return (
    <span className={`${BADGE_BASE} ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
}

export function TicketsListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | TicketStatus>("");
  const [priority, setPriority] = useState<"" | TicketPriority>("");
  const [sort, setSort] = useState("createdAt_desc");
  const [page, setPage] = useState(1);

  const params: ListTicketsParams = {
    page,
    limit: 10,
    sort,
    ...(search.trim() && { q: search.trim() }),
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const { data, isLoading, isError, error, refetch } = useQuery(
    ["tickets", params],
    () => fetchTickets(params),
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : "Failed to load tickets"
        }
        onRetry={() => refetch()}
      />
    );
  }

  const tickets = data!.items;
  const totalPages = data!.totalPages;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tickets</h1>

      <div className="mb-8 space-y-4">
        <div>
          <label htmlFor="search" className="sr-only">
            Search tickets
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "" | TicketStatus);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority-filter" className="sr-only">
              Filter by priority
            </label>
            <select
              id="priority-filter"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as "" | TicketPriority);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          No tickets yet. Create one to get started.
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="block px-5 py-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {ticket.title}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <span className="text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-400" aria-hidden>
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                Previous
              </button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
