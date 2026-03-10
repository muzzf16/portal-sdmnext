import { useEffect, useCallback } from 'react';

/**
 * Lightweight cross-component data refresh using browser CustomEvent.
 * 
 * Usage:
 *   // Emit after mutation success
 *   emitRefresh('wla-entry');
 * 
 *   // Subscribe to refresh events
 *   useOnRefresh('wla-entry', () => fetchData());
 *   useOnRefresh(['wla-entry', 'activity-library'], () => fetchData()); // multiple domains
 */

export type RefreshDomain =
    | 'activity-library'
    | 'workload'
    | 'wla-entry'
    | 'wla-status'
    | 'kpi'
    | 'task'
    | 'penilaian';

const EVENT_PREFIX = 'portal-sdm:refresh:';

/**
 * Dispatch a refresh event for a given domain.
 * Call this after any successful mutation (create/update/delete).
 */
export function emitRefresh(domain: RefreshDomain): void {
    window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${domain}`));
}

/**
 * Subscribe to refresh events for one or more domains.
 * The callback is called whenever any of the specified domains emit a refresh.
 * Automatically cleans up on unmount.
 */
export function useOnRefresh(
    domains: RefreshDomain | RefreshDomain[],
    callback: () => void
): void {
    // Stabilize callback reference
    const stableCallback = useCallback(callback, [callback]);

    useEffect(() => {
        const domainList = Array.isArray(domains) ? domains : [domains];
        const handler = () => stableCallback();

        domainList.forEach(domain => {
            window.addEventListener(`${EVENT_PREFIX}${domain}`, handler);
        });

        return () => {
            domainList.forEach(domain => {
                window.removeEventListener(`${EVENT_PREFIX}${domain}`, handler);
            });
        };
    }, [domains, stableCallback]);
}
