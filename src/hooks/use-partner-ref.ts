import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const REF_KEY = "mrc_partner_ref";

/** Captures ?ref= from the URL and persists it in sessionStorage. */
export const usePartnerRef = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      sessionStorage.setItem(REF_KEY, ref);
    }
  }, [searchParams]);
};

/** Returns the stored partner referral code, if any. */
export const getPartnerRef = (): string | null =>
  sessionStorage.getItem(REF_KEY);
