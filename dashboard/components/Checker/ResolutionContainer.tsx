"use client";

interface CheckerResult {
  hostname: string;
  ipv4: string[];
  ipv6: string[];
  error?: string;
}

interface ResolutionContainerProps {
  result: CheckerResult | null;
}

export default function ResolutionContainer({
  result,
}: ResolutionContainerProps) {
  if (!result) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-700 rounded border">
      <div className="space-y-2">
        <div>
          <span className="text-gray-400 text-base">Hostname: </span>
          <span className="text-white font-mono text-base">
            {result.hostname}
          </span>
        </div>

        {result.error ? (
          <div>
            <span className="text-red-400 text-base">Error: </span>
            <span className="text-red-300 text-base">{result.error}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {result.ipv4.length > 0 && (
              <div>
                <span className="text-gray-400 text-base">
                  IPv4 Addresses:{" "}
                </span>
                <div className="mt-1 space-y-1">
                  {result.ipv4.map((ip, index) => (
                    <div
                      key={index}
                      className="text-green-300 font-mono text-base"
                    >
                      {ip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.ipv6.length > 0 && (
              <div>
                <span className="text-gray-400 text-base">
                  IPv6 Addresses:{" "}
                </span>
                <div className="mt-1 space-y-1">
                  {result.ipv6.map((ip, index) => (
                    <div
                      key={index}
                      className="text-blue-300 font-mono text-base"
                    >
                      {ip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.ipv4.length === 0 && result.ipv6.length === 0 && (
              <span className="text-yellow-300 text-base">
                No IP addresses found
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
