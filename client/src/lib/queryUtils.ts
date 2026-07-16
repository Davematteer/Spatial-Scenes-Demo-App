import { useQuery } from "@tanstack/react-query";
import { SupervisorTraceResponse } from "shared";
// Import the new response type from your shared types library

/**
 * Custom React query hook to trace full transactional lifecycles across system legs.
 */
export function useTransactionTrace(inputRef: string) {
  return useQuery<SupervisorTraceResponse, Error>({
    queryKey: ["transactionTrace", inputRef],
    queryFn: async () => {
      const response = await fetch(`/api/trace/${encodeURIComponent(inputRef.trim())}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to execute transaction pipeline trace.");
      }

      return payload as SupervisorTraceResponse;
    },
    enabled: inputRef.trim().length > 0,
    retry: 1,
    staleTime: 10 * 1000, // 10-second data freshness cache
  });
}