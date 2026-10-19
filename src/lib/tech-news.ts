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

// Curated latest cybersecurity dispatches from The Hacker News (https://thehackernews.com/)
const FALLBACK_UPDATES: TechUpdate[] = [
  {
    id: "thn-1",
    title: "OpenCode Console Breach May Have Exposed OpenAI, Anthropic, and Google API Keys",
    url: "https://thehackernews.com/2026/10/opencode-console-breach-may-have.html",
    source: "The Hacker News",
    timeAgo: "today",
    category: "Cybersecurity",
  },
  {
    id: "thn-2",
    title: "ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants",
    url: "https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html",
    source: "The Hacker News",
    timeAgo: "yesterday",
    category: "Cloud Security",
  },
  {
    id: "thn-3",
    title: "MALFEX npm Package 'imgdecode' Hides Shellcode Loader in Windows Native Addon",
    url: "https://thehackernews.com/2026/10/malfex-npm-package-imgdecode-hides.html",
    source: "The Hacker News",
    timeAgo: "2d ago",
    category: "Supply Chain",
  },
];

function formatTimeAgo(dateInput: string | number): string {
  const timestampMs = typeof dateInput === "number" ? dateInput * 1000 : new Date(dateInput).getTime();
  if (isNaN(timestampMs)) return "today";

  const diffMinutes = Math.floor((Date.now() - timestampMs) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Parses XML feed from The Hacker News Feedburner mirror as fallback
 */
function parseFeedburnerXml(xmlText: string): TechUpdate[] {
  const items: TechUpdate[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null && items.length < 5) {
    const itemBlock = match[1];
    const titleMatch = itemBlock.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    if (titleMatch && titleMatch[1]) {
      const rawTitle = titleMatch[1].trim();
      const rawLink = linkMatch ? linkMatch[1].trim() : "https://thehackernews.com";
      const link = rawLink.startsWith("http://") ? "https://" + rawLink.slice(7) : rawLink;
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";

      items.push({
        id: link,
        title: rawTitle,
        url: link,
        source: "The Hacker News",
        timeAgo: pubDate ? formatTimeAgo(pubDate) : "today",
        category: "Cybersecurity",
      });
    }
  }
  return items;
}

interface BloggerEntry {
  id?: { $t?: string };
  title?: { $t?: string };
  published?: { $t?: string };
  link?: Array<{ rel?: string; href?: string }>;
}

interface BloggerFeedResponse {
  feed?: {
    entry?: BloggerEntry[];
  };
}

/**
 * Fetches the latest live cybersecurity dispatches directly from The Hacker News (https://thehackernews.com/).
 * Automatically revalidates every 30 minutes (1800 seconds) via Next.js ISR.
 */
export async function getLatestTechNews(): Promise<TechUpdate[]> {
  // 1. Primary Source: Direct JSON feed from The Hacker News (Blogger engine)
  try {
    const response = await fetch(
      "https://thehackernews.com/feeds/posts/default?alt=json",
      {
        next: { revalidate: 1800 },
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    );

    if (response.ok) {
      const data = (await response.json()) as BloggerFeedResponse;
      const entries = data?.feed?.entry || [];

      if (entries.length > 0) {
        const updates: TechUpdate[] = entries.slice(0, 5).map((e: any) => {
          const rawLink =
            (e.link || []).find((l: any) => l.rel === "alternate")?.href ||
            "https://thehackernews.com";
          const link = rawLink.startsWith("http://")
            ? "https://" + rawLink.slice(7)
            : rawLink;

          const title = (e.title?.$t || "").trim();
          const published = e.published?.$t || "";

          return {
            id: e.id?.$t || link,
            title,
            url: link,
            source: "The Hacker News",
            timeAgo: published ? formatTimeAgo(published) : "today",
            category: "Cybersecurity",
          };
        });

        const validUpdates = updates.filter((u) => u.title.length > 5);
        if (validUpdates.length > 0) {
          return validUpdates;
        }
      }
    }
  } catch (error) {
    console.warn("The Hacker News primary JSON feed attempt failed:", error);
  }

  // 2. Secondary Fallback: The Hacker News Feedburner RSS XML
  try {
    const rssResponse = await fetch("https://feeds.feedburner.com/TheHackersNews", {
      next: { revalidate: 1800 },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (rssResponse.ok) {
      const xmlText = await rssResponse.text();
      const parsed = parseFeedburnerXml(xmlText);
      if (parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("The Hacker News secondary RSS feed attempt failed:", error);
  }

  // 3. Tertiary fallback: Curated latest security articles
  return FALLBACK_UPDATES;
}
