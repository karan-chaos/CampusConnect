import { useState, useRef, useEffect, useCallback } from "react";
import Bell from "lucide-react/dist/esm/icons/bell";
import BellOff from "lucide-react/dist/esm/icons/bell-off";
import Check from "lucide-react/dist/esm/icons/check";
import CheckCheck from "lucide-react/dist/esm/icons/check-check";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Settings from "lucide-react/dist/esm/icons/settings";
import X from "lucide-react/dist/esm/icons/x";
import { Button } from "@/components/ui/button";
import {
  useLostFoundNotifications,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_ICONS,
  type NotificationPreferences,
} from "@/hooks/useLostFoundNotifications";

// ─── Time formatter ───────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ─── Preferences Panel ────────────────────────────────────────────────────────

function PreferencesPanel({
  preferences,
  onUpdate,
  onClose,
}: {
  preferences: NotificationPreferences;
  onUpdate: (prefs: Partial<NotificationPreferences>) => void;
  onClose: () => void;
}) {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const togglePref = (key: keyof NotificationPreferences) => {
    setLocalPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      onUpdate({ [key]: next[key] });
      return next;
    });
  };

  const notifTypes = [
    { key: "new_match_enabled" as const, label: "Potential Matches", desc: "When items match your lost reports" },
    { key: "claim_received_enabled" as const, label: "Claims Received", desc: "When someone claims your lost item" },
    { key: "claim_accepted_enabled" as const, label: "Claims Accepted", desc: "When owners accept your claims" },
    { key: "claim_rejected_enabled" as const, label: "Claims Rejected", desc: "When owners reject your claims" },
    { key: "bounty_funded_enabled" as const, label: "Bounty Funded", desc: "When bounties are posted on items" },
    { key: "bounty_released_enabled" as const, label: "Bounty Released", desc: "When bounty funds are released" },
    { key: "item_resolved_enabled" as const, label: "Item Resolved", desc: "When items are marked as found" },
    { key: "comment_added_enabled" as const, label: "Comments", desc: "When someone comments on an item" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs font-black uppercase text-black">Notification Types</h4>
        <button onClick={onClose} className="text-black/40 hover:text-black">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {notifTypes.map((nt) => (
          <label
            key={nt.key}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-black/10 bg-cream/30 px-3 py-2 hover:bg-cream/60 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-black">{nt.label}</p>
              <p className="text-[10px] text-black/40">{nt.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => togglePref(nt.key)}
              className={`relative h-5 w-9 rounded-full border-2 border-black transition-colors ${
                localPrefs[nt.key] ? "bg-lime" : "bg-white"
              }`}
              aria-label={`Toggle ${nt.label}`}
            >
              <div
                className={`absolute top-0.5 h-3.5 w-3.5 rounded-full border border-black bg-black transition-transform ${
                  localPrefs[nt.key] ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        ))}
      </div>
      <div className="border-t border-black/10 pt-3 space-y-2">
        <p className="font-mono text-[10px] font-black uppercase text-black/40">Channels</p>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => togglePref("push_enabled")}
              className={`relative h-4 w-7 rounded-full border-2 border-black transition-colors ${
                localPrefs.push_enabled ? "bg-lime" : "bg-white"
              }`}
            >
              <div
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full border border-black bg-black transition-transform ${
                  localPrefs.push_enabled ? "translate-x-3" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-[10px] font-bold text-black/60">Push</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => togglePref("email_enabled")}
              className={`relative h-4 w-7 rounded-full border-2 border-black transition-colors ${
                localPrefs.email_enabled ? "bg-lime" : "bg-white"
              }`}
            >
              <div
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full border border-black bg-black transition-transform ${
                  localPrefs.email_enabled ? "translate-x-3" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-[10px] font-bold text-black/60">Email</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Main Bell Component ──────────────────────────────────────────────────────

export default function LostFoundNotificationBell() {
  const {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    isLoading,
  } = useLostFoundNotifications();

  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowPrefs(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setShowPrefs(false);
      }
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleNotificationClick = useCallback(
    (notifId: string, itemId: string) => {
      markAsRead(notifId);
      // Navigate to item
      window.location.hash = `#${itemId}`;
      setOpen(false);
    },
    [markAsRead],
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setShowPrefs(false);
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-white transition-all hover:bg-cream active:translate-x-0.5 active:translate-y-0.5"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        {preferences.push_enabled ? (
          <Bell className="h-4 w-4 text-black" />
        ) : (
          <BellOff className="h-4 w-4 text-black/40" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-black bg-peach px-1 text-[8px] font-black text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {showPrefs ? (
            <div className="p-4">
              <PreferencesPanel
                preferences={preferences}
                onUpdate={(prefs) => updatePreferences(prefs)}
                onClose={() => setShowPrefs(false)}
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-black uppercase text-black">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-peach px-1.5 py-0.5 text-[8px] font-black border border-black/20">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-black/50 hover:bg-cream hover:text-black transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>Read all</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowPrefs(true)}
                    className="rounded-md p-1 text-black/40 hover:bg-cream hover:text-black transition-colors"
                    title="Notification settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[320px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BellOff className="mb-2 h-8 w-8 text-black/15" />
                    <p className="text-xs font-mono font-bold text-black/30">No notifications yet</p>
                    <p className="text-[10px] text-black/20">Lost & found alerts will appear here</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-black/5 transition-colors cursor-pointer hover:bg-cream/50 ${
                        !notif.read ? "bg-lime/10" : ""
                      }`}
                      onClick={() => handleNotificationClick(notif.id, notif.item_id)}
                    >
                      <span className="mt-0.5 text-base" role="img">
                        {NOTIFICATION_TYPE_ICONS[notif.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-black truncate">{notif.title}</p>
                          {!notif.read && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-peach" />
                          )}
                        </div>
                        <p className="text-[10px] text-black/50 truncate mt-0.5">{notif.body}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-black/30">{timeAgo(notif.created_at)}</span>
                          <span className="text-[9px] font-mono text-black/20 uppercase">
                            {NOTIFICATION_TYPE_LABELS[notif.type]}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="shrink-0 rounded p-1 text-black/20 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t-2 border-black/10 px-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-2 border-black font-mono text-[10px] font-black uppercase"
                    onClick={() => {
                      window.location.href = "/settings#notifications";
                      setOpen(false);
                    }}
                  >
                    Manage All Notifications
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
