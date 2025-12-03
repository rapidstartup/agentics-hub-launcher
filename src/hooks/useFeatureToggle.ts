import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  isFeatureEnabled as checkFeatureEnabled,
  getEffectiveFeatures,
  type EffectiveFeature,
} from "@/integrations/feature-toggles/api";

interface UseFeatureToggleResult {
  enabled: boolean;
  loading: boolean;
  isOverridden: boolean;
  error: Error | null;
}

/**
 * Hook to check if a specific feature is enabled for the current client
 * @param featureKey The feature key to check (e.g., 'department.advertising', 'agent.ad-spy')
 * @param clientSlug Optional client slug override. Uses URL param if not provided.
 */
export function useFeatureToggle(
  featureKey: string,
  clientSlug?: string
): UseFeatureToggleResult {
  const params = useParams();
  const effectiveClientSlug = clientSlug || params.clientId;

  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isOverridden, setIsOverridden] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkEnabled = useCallback(async () => {
    if (!featureKey) {
      setEnabled(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let clientId: string | null = null;

      // Get client ID from slug
      if (effectiveClientSlug) {
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("slug", effectiveClientSlug)
          .single();
        clientId = client?.id || null;
      }

      // Check feature state
      if (clientId) {
        const features = await getEffectiveFeatures(clientId);
        const feature = features.find((f) => f.feature_key === featureKey);
        setEnabled(feature?.enabled ?? true);
        setIsOverridden(feature?.is_overridden ?? false);
      } else {
        // No client context - use platform default
        const result = await checkFeatureEnabled(featureKey);
        setEnabled(result);
        setIsOverridden(false);
      }
    } catch (e) {
      console.error("Failed to check feature toggle:", e);
      setError(e as Error);
      setEnabled(true); // Default to enabled on error
    } finally {
      setLoading(false);
    }
  }, [featureKey, effectiveClientSlug]);

  useEffect(() => {
    checkEnabled();
  }, [checkEnabled]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`feature-toggle-${featureKey}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "platform_feature_toggles" },
        () => checkEnabled()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_feature_toggles" },
        () => checkEnabled()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [featureKey, checkEnabled]);

  return { enabled, loading, isOverridden, error };
}

/**
 * Hook to get all effective features for the current client
 */
export function useAllFeatureToggles(clientSlug?: string) {
  const params = useParams();
  const effectiveClientSlug = clientSlug || params.clientId;

  const [features, setFeatures] = useState<EffectiveFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (effectiveClientSlug) {
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("slug", effectiveClientSlug)
          .single();

        if (client) {
          const effectiveFeatures = await getEffectiveFeatures(client.id);
          setFeatures(effectiveFeatures);
        }
      }
    } catch (e) {
      console.error("Failed to load feature toggles:", e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [effectiveClientSlug]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const isEnabled = useCallback(
    (featureKey: string): boolean => {
      const feature = features.find((f) => f.feature_key === featureKey);
      return feature?.enabled ?? true;
    },
    [features]
  );

  return { features, loading, error, isEnabled, refresh: loadFeatures };
}

/**
 * Hook to check multiple features at once
 */
export function useFeatureToggles(
  featureKeys: string[],
  clientSlug?: string
): Record<string, boolean> {
  const { features, loading, isEnabled } = useAllFeatureToggles(clientSlug);

  if (loading) {
    // Return all true while loading to avoid flash
    return featureKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {});
  }

  return featureKeys.reduce((acc, key) => ({ ...acc, [key]: isEnabled(key) }), {});
}

/**
 * Component wrapper that conditionally renders based on feature flag
 */
export function FeatureFlag({
  featureKey,
  children,
  fallback = null,
}: {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { enabled, loading } = useFeatureToggle(featureKey);

  if (loading) return null;
  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}

