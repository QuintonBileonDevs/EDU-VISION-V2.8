import { useState, useEffect, useCallback } from "react";

export function usePermissions(currentUserId?: number) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchPermissions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${currentUserId}/permissions`);
        const data = await res.json();
        if (data.success && isMounted) {
          setPermissions(data.permissions || []);
        }
      } catch (err) {
        console.error("usePermissions fetch error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPermissions();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const hasPermission = useCallback((permission: string) => {
    // Fallback: If user is super_admin (currentUserId === 1), they have all permissions
    if (currentUserId === 1) return true;
    return permissions.includes(permission);
  }, [permissions, currentUserId]);

  return { permissions, loading, hasPermission };
}
