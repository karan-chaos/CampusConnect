import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import { useQuery, useMutation, useQueryClient } from "@/hooks/useReactQueryReplacement";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LostFoundNotification {
  id: string;
  user_id: string;
  type: "new_match" | "claim_received" | "claim_accepted" | "claim_rejected" | "bounty_funded" | "bounty_released" | "item_resolved" | "comment_added";
  title: string;
  body: string;
  item_id: string;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  new_match_enabled: boolean;
  claim_received_enabled: boolean;
  claim_accepted_enabled: boolean;
  claim_rejected_enabled: boolean;
  bounty_funded_enabled: boolean;
  bounty_released_enabled: boolean;
  item_resolved_enabled: boolean;
  comment_added_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
}

// ─── Default preferences ──────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: NotificationPreferences = {
  new_match_enabled: true,
  claim_received_enabled: true,
  claim_accepted_enabled: true,
  claim_rejected_enabled: true,
  bounty_funded_enabled: true,
  bounty_released_enabled: true,
  item_resolved_enabled: true,
  comment_added_enabled: true,
  push_enabled: true,
  email_enabled: false,
};

// ─── Notification type labels ─────────────────────────────────────────────────

export const NOTIFICATION_TYPE_LABELS: Record<LostFoundNotification["type"], string> = {
  new_match: "Potential Match Found",
  claim_received: "Someone Found Your Item",
  claim_accepted: "Claim Accepted",
  claim_rejected: "Claim Rejected",
  bounty_funded: "Bounty Posted",
  bounty_released: "Bounty Released",
  item_resolved: "Item Resolved",
  comment_added: "New Comment",
};

export const NOTIFICATION_TYPE_ICONS: Record<LostFoundNotification["type"], string> = {
  new_match: "🔍",
  claim_received: "🤝",
  claim_accepted: "✅",
  claim_rejected: "❌",
  bounty_funded: "💰",
  bounty_released: "🎉",
  item_resolved: "📦",
  comment_added: "💬",
};

// ─── Hook: useLostFoundNotifications ──────────────────────────────────────────

export function useLostFoundNotifications() {
  const supabase = createClient();
  const { user } = useAuthHydration();
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch notifications ──────────────────────────────────────────────────────
  const {
    data: notifications = [],
    refetch,
    isLoading,
  } = useQuery<LostFoundNotification[]>({
    queryKey: ["lf_notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lost_found_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LostFoundNotification[];
    },
    enabled: !!user,
  });

  // ── Fetch preferences ────────────────────────────────────────────────────────
  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["lf_notification_prefs", user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_PREFERENCES;
      const { data, error } = await supabase
        .from("lost_found_notification_prefs")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as NotificationPreferences) || DEFAULT_PREFERENCES;
    },
    enabled: !!user,
  });

  // ── Update preferences ───────────────────────────────────────────────────────
  const { mutate: updatePreferences } = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("lost_found_notification_prefs").upsert(
        { user_id: user.id, ...prefs },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lf_notification_prefs"] });
      toast.success("Notification preferences updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Mark as read ─────────────────────────────────────────────────────────────
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("lost_found_notifications")
        .update({ read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lf_notifications"] });
    },
  });

  // ── Mark all as read ─────────────────────────────────────────────────────────
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("lost_found_notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lf_notifications"] });
    },
  });

  // ── Delete notification ──────────────────────────────────────────────────────
  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("lost_found_notifications")
        .delete()
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lf_notifications"] });
    },
  });

  // ── Compute unread count ─────────────────────────────────────────────────────
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // ── Realtime subscription ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("lost_found_notifications_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lost_found_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as LostFoundNotification;
          refetch();

          // Show toast for new notifications
          toast.info(`${NOTIFICATION_TYPE_ICONS[newNotif.type]} ${newNotif.title}`, {
            description: newNotif.body,
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lost_found_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetch();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user, supabase, refetch]);

  return {
    notifications,
    unreadCount,
    preferences: preferences || DEFAULT_PREFERENCES,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refetch,
  };
}

// ─── Hook: useLostFoundNotificationBadge ──────────────────────────────────────

export function useLostFoundNotificationBadge() {
  const { unreadCount } = useLostFoundNotifications();
  return unreadCount;
}

// ─── Hook: useCreateLostFoundNotification ─────────────────────────────────────
// For server-side or edge function use to create notifications

export function useCreateLostFoundNotification() {
  const supabase = createClient();

  const createNotification = useCallback(
    async (params: {
      userId: string;
      type: LostFoundNotification["type"];
      title: string;
      body: string;
      itemId: string;
    }) => {
      const { error } = await supabase.from("lost_found_notifications").insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        item_id: params.itemId,
        read: false,
      });
      if (error) throw error;
    },
    [supabase],
  );

  return { createNotification };
}
