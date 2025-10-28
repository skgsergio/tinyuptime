"use client";

import { useState, useCallback, useEffect } from "react";
import Container from "./Container";
import ResolutionContainer from "./ResolutionContainer";

interface CheckerResult {
  hostname: string;
  ipv4: string[];
  ipv6: string[];
  error?: string;
}

interface DNSRecord {
  type: number;
  data: string;
}

interface DNSResponse {
  Status: number;
  Answer?: DNSRecord[];
}

export default function Checker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<CheckerResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to update URL hash with check parameter
  const updateUrlHash = (checkUrl: string) => {
    if (typeof window === "undefined") return;

    let hash = window.location.hash.replace(/([&#]check=)[^&]*/g, "");
    hash = hash.replace(/[&#]$/, "");
    const prefix =
      hash && hash !== "#" ? (hash.endsWith("&") ? hash : hash + "&") : "#";
    window.location.hash = `${prefix}check=${encodeURIComponent(checkUrl)}`;
  };

  const isIPAddress = useCallback((input: string): boolean => {
    // Check for IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(input)) {
      return input.split(".").every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }

    // Check for IPv6 (simple check for colons and hex characters)
    if (input.includes(":")) {
      const ipv6Regex = /^[0-9a-fA-F:]+$/;
      return ipv6Regex.test(input);
    }

    return false;
  }, []);

  const extractHostname = useCallback(
    (input: string): string | null => {
      // If it's already an IP address, return it directly
      if (isIPAddress(input)) {
        return input;
      }

      // If it's a raw IPv6 address, return it directly
      if (input.includes(":") && !input.includes("://")) {
        return input;
      }

      try {
        // Add protocol if missing
        const fullUrl = input.startsWith("http") ? input : `https://${input}`;
        const urlObj = new URL(fullUrl);
        let hostname = urlObj.hostname;

        // Remove brackets from IPv6 addresses in URLs
        if (hostname.startsWith("[") && hostname.endsWith("]")) {
          hostname = hostname.slice(1, -1);
        }

        return hostname;
      } catch {
        return null;
      }
    },
    [isIPAddress],
  );

  const resolveDNS = useCallback(
    async (hostname: string): Promise<{ ipv4: string[]; ipv6: string[] }> => {
      // Resolve both IPv4 and IPv6 addresses using Google's DNS over HTTPS
      const [ipv4Response, ipv6Response] = await Promise.allSettled([
        fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
          {
            headers: { Accept: "application/dns-json" },
          },
        ),
        fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=AAAA`,
          {
            headers: { Accept: "application/dns-json" },
          },
        ),
      ]);

      const processResponse = async (
        response: PromiseSettledResult<Response>,
        recordType: number,
      ) => {
        if (response.status === "rejected") {
          console.warn(
            `DNS query failed for type ${recordType}:`,
            response.reason,
          );
          return [];
        }

        try {
          if (!response.value.ok) {
            throw new Error(`DNS query failed: ${response.value.status}`);
          }

          const data: DNSResponse = await response.value.json();

          if (data.Status !== 0) {
            const errorMessages: { [key: number]: string } = {
              1: "Format Error",
              2: "Server Failure",
              3: "Name Error (NXDOMAIN)",
              4: "Not Implemented",
              5: "Query Refused",
            };
            const errorMsg =
              errorMessages[data.Status] || `Unknown error (${data.Status})`;
            throw new Error(`DNS error: ${errorMsg}`);
          }

          return (
            data.Answer?.filter(
              (record: DNSRecord) => record.type === recordType,
            ).map((record: DNSRecord) => record.data) || []
          );
        } catch (error) {
          console.warn(`DNS resolution error for type ${recordType}:`, error);
          return [];
        }
      };

      const [ipv4, ipv6] = await Promise.all([
        processResponse(ipv4Response, 1), // A record
        processResponse(ipv6Response, 28), // AAAA record
      ]);

      return { ipv4, ipv6 };
    },
    [],
  );

  const handleResolve = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    // Update URL hash with the URL being checked
    updateUrlHash(url.trim());

    try {
      const hostname = extractHostname(url);

      if (!hostname) {
        setResult({
          hostname: url,
          ipv4: [],
          ipv6: [],
          error: "Invalid URL format",
        });
        return;
      }

      // Check if it's already an IP address
      if (isIPAddress(hostname)) {
        const isIPv6 = hostname.includes(":");
        setResult({
          hostname, // Display the hostname as entered by the user
          ipv4: isIPv6 ? [] : [hostname],
          ipv6: isIPv6 ? [hostname] : [],
        });
        return;
      }

      const { ipv4, ipv6 } = await resolveDNS(hostname);
      setResult({
        hostname,
        ipv4,
        ipv6,
      });
    } catch (error) {
      setResult({
        hostname: extractHostname(url) || url,
        ipv4: [],
        ipv6: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-run check on load if URL hash contains check parameter
  useEffect(() => {
    // Get URL from hash on client-side only
    const getInitialUrl = () => {
      if (typeof window === "undefined") return "";
      const match = window.location.hash.match(/check=([^&#]*)/);
      return match && match[1] ? decodeURIComponent(match[1]) : "";
    };

    const initialUrl = getInitialUrl();
    if (initialUrl) {
      setUrl(initialUrl);

      // Create a separate async function to avoid dependency issues
      const runInitialCheck = async () => {
        if (!initialUrl.trim()) return;

        setLoading(true);
        setResult(null);

        // Update URL hash with the URL being checked
        updateUrlHash(initialUrl.trim());

        try {
          const hostname = extractHostname(initialUrl);

          if (!hostname) {
            setResult({
              hostname: initialUrl,
              ipv4: [],
              ipv6: [],
              error: "Invalid URL format",
            });
            return;
          }

          // Check if it's already an IP address
          if (isIPAddress(hostname)) {
            const isIPv6 = hostname.includes(":");
            setResult({
              hostname, // Display the hostname as entered by the user
              ipv4: isIPv6 ? [] : [hostname],
              ipv6: isIPv6 ? [hostname] : [],
            });
            return;
          }

          const { ipv4, ipv6 } = await resolveDNS(hostname);
          setResult({
            hostname,
            ipv4,
            ipv6,
          });
        } catch (error) {
          setResult({
            hostname: extractHostname(initialUrl) || initialUrl,
            ipv4: [],
            ipv6: [],
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        } finally {
          setLoading(false);
        }
      };

      runInitialCheck();
    }
  }, [extractHostname, resolveDNS, isIPAddress]); // Include dependencies for the functions used

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleResolve();
    }
  };

  return (
    <Container className="h-auto">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL, hostname, or IP address (e.g. https://example.net, example.com, 2001:db8::1, ...)"
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleResolve}
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>

        <ResolutionContainer result={result} />
      </div>
    </Container>
  );
}
