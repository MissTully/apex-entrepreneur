import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { fetchProgress, type ProgressMap } from '../lib/progress';

/**
 * The signed-in learner's phase progress, plus a `reload` for after a phase is
 * recorded as complete.
 *
 * One hook rather than the same effect copied into the Program grid, the Phase
 * page, the Profile, and the certificate — and one place to get the loading and
 * cancellation right. Signed-out visitors get an empty map, which every consumer
 * renders as "not started".
 */
export function useProgress(): { progress: ProgressMap; loading: boolean; reload: () => Promise<void> } {
    const { user } = useAuth();
    const userId = user?.id;

    const [progress, setProgress] = useState<ProgressMap>({});
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (): Promise<ProgressMap> => {
        // Always await, so callers (and the effect below) stay off the
        // synchronous render path even when there's nothing to fetch.
        return userId ? fetchProgress(userId) : Promise.resolve({});
    }, [userId]);

    useEffect(() => {
        let live = true;
        load().then((p) => {
            if (!live) return;
            setProgress(p);
            setLoading(false);
        });
        return () => {
            live = false;
        };
    }, [load]);

    const reload = useCallback(async () => {
        const p = await load();
        setProgress(p);
    }, [load]);

    return { progress, loading, reload };
}
