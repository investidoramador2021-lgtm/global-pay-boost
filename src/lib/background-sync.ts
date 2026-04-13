/**
 * Register a Background Sync tag so the service worker retries
 * queued ChangeNOW requests once the network is restored.
 *
 * Call this from catch blocks around swap API calls.
 */
export async function registerSwapRetrySync(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    // @ts-expect-error – SyncManager types not in default lib
    await reg.sync.register("swap-retry");
    return true;
  } catch {
    return false;
  }
}
