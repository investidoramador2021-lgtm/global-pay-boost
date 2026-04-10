import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// The VAPID public key must be set here for the browser subscription
// This is the APPLICATION SERVER KEY - safe to expose publicly
const VAPID_PUBLIC_KEY = "BDgffElKbsGU6BVYuYZsYr_8YTP9jM-mRxvbgzj4XMRgbE8fU2WNWqaM_n-vd9NtrHt60RNlDXMJtm0FfV2dhGM";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check existing subscription
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = useCallback(async (transactionId?: string): Promise<boolean> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported");
      return false;
    }

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subJson = subscription.toJSON();
      
      // Store in database
      const { error } = await supabase.from("push_subscriptions" as any).upsert(
        {
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh || "",
          auth_key: subJson.keys?.auth || "",
          transaction_id: transactionId || null,
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        console.error("Failed to store push subscription:", error);
        setLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Push subscription error:", err);
      setLoading(false);
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!("serviceWorker" in navigator)) return;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await supabase.from("push_subscriptions" as any).delete().eq("endpoint", endpoint);
    }
    
    setIsSubscribed(false);
  }, []);

  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

  return { permission, isSubscribed, loading, subscribe, unsubscribe, supported };
}
