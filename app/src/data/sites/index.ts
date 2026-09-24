import type { SiteDoc } from "@/data/types";
import { auth } from "@/data/sites/auth";
import { ksm } from "@/data/sites/ksm";
import { unistom } from "@/data/sites/unistom";

/**
 * Every site shown in the hub lives here as one entry. To add a new
 * site: copy `_template.ts`, fill it in, and add it to this array.
 */
export const sites: SiteDoc[] = [unistom, ksm, auth];

export function getSite(slug: string): SiteDoc | undefined {
  return sites.find((site) => site.slug === slug);
}

/** The most recent version — versions are stored oldest first. */
export function latestVersion(site: SiteDoc) {
  return site.versions[site.versions.length - 1];
}
