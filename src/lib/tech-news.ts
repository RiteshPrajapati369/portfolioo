export interface TechUpdate {
  id: string;
  title: string;
  url: string;
  source: string;
  timeAgo: string;
  points?: number;
  commentsCount?: number;
  category?: string;
}

// Fallback high-quality curated cybersecurity and tech updates in case API is offline
const FALLBACK_UPDATES: TechUpdate[] = [
  {
    id: "fb-1",
    title: "Linux Kernel Hardening: Memory Safety Mitigations and BPF Boundary Checks",
    url: "https://news.ycombinator.com",
    source: "Hacker News / Kernel.org",
    timeAgo: "1h ago",
    points: 342,
    commentsCount: 98,
    category: "Cybersecurity",
  },
  {
    id: "fb-2",
    title: "Post-Quantum Cryptography: NIST Finalizes First Standardized Quantum-Resistant Algorithms",
    url: "https://news.ycombinator.com",
    source: "Hacker News / NIST",
    timeAgo: "3h ago",
    points: 512,
    commentsCount: 145,
    category: "Cryptography",
  },
  {
    id: "fb-3",
    title: "Critical RCE Vulnerability in OpenSSH Handled via Prompt Patch Distribution",
    url: "https://news.ycombinator.com",
    source: "Hacker News / Security Advisories",
    timeAgo: "5h ago",
    points: 620,
    commentsCount: 210,
    category: "Vulnerability",
  },
  {
    id: "fb-4",
    title: "DNS Security Extensions and Encrypted Client Hello (ECH) Rollout Accelerates",
    url: "https://news.ycombinator.com",
    source: "Hacker News / IETF",
    timeAgo: "6h ago",
    points: 285,
    commentsCount: 74,
    category: "Network Defense",
  },
];

function formatTimeAgo(timestampSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diffMinutes = Math.floor((now - timestampSeconds) / 60);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface AlgoliaHit {
  objectID: string;
  title: string;
  url?: string;
  points?: number;
  num_comments?: number;
  created_at_i: number;
}

/**
 * Fetches the latest cybersecurity and top technology news from Hacker News.
 * Revalidates automatically every 2 hours (7200 seconds) via Next.js ISR cache.
 */
export async function getLatestTechNews(): Promise<TechUpdate[]> {
  try {
    // Search for security/cybersecurity/tech stories on Hacker News Algolia API
    const response = await fetch(
      "https://hn.algolia.com/api/v1/search?query=security+OR+vulnerability+OR+linux+OR+crypto&tags=story&hitsPerPage=8",
      {
        next: { revalidate: 7200 }, // updates automatically every 2 hours
        headers: {
          Accept: "application/json",
          "User-Agent": "RiteshCyberPortfolio/1.0",
        },
      }
    );

    if (!response.ok) {
      return FALLBACK_UPDATES;
    }

    const data = (await response.json()) as { hits: AlgoliaHit[] };

    if (!data.hits || data.hits.length === 0) {
      return FALLBACK_UPDATES;
    }

    const updates: TechUpdate[] = data.hits
      .filter((hit) => Boolean(hit.title && hit.title.trim().length > 10))
      .slice(0, 5)
      .map((hit) => {
        const url =
          hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
        return {
          id: hit.objectID,
          title: hit.title,
          url,
          source: "Hacker News",
          timeAgo: formatTimeAgo(hit.created_at_i),
          points: hit.points || 0,
          commentsCount: hit.num_comments || 0,
          category: "Tech & Security",
        };
      });

    return updates.length > 0 ? updates : FALLBACK_UPDATES;
  } catch {
    // Return curated fallback in case of network timeout, build isolation, or rate limits
    return FALLBACK_UPDATES;
  }
}
