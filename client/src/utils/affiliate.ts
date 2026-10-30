/**
 * Sanitizes and injects affiliate monetization parameters for Indian retailers.
 */
export function generateAffiliateUrl(originalUrl: string, platform: string): string {
  // Reject unsafe schemes
  const lowered = originalUrl.trim().toLowerCase();
  if (
    lowered.startsWith("javascript:") ||
    lowered.startsWith("data:") ||
    lowered.startsWith("file:")
  ) {
    throw new Error("Malicious URL protocol rejected");
  }

  try {
    const url = new URL(originalUrl);
    const platformLower = platform.toLowerCase();

    // 1. Amazon India affiliate tag injection
    if (url.hostname.includes("amazon.in") || platformLower === "amazon") {
      const amazonTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "proteindex-21";
      url.searchParams.set("tag", amazonTag);
      return url.toString();
    }

    // 2. CueLinks redirect wrapping for general Indian retailers
    const cuelinksPubId = process.env.NEXT_PUBLIC_CUELINKS_PUB_ID;
    if (cuelinksPubId && !url.hostname.includes("cuelinks.com")) {
      return `https://linksredirect.com/?pub_id=${encodeURIComponent(
        cuelinksPubId
      )}&url=${encodeURIComponent(url.toString())}`;
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return sanitized string directly
    return originalUrl;
  }
}
