import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import { toast } from "sonner";
import X from "lucide-react/dist/esm/icons/x";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Clock from "lucide-react/dist/esm/icons/clock";
import Tag from "lucide-react/dist/esm/icons/tag";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Coins from "lucide-react/dist/esm/icons/coins";
import User from "lucide-react/dist/esm/icons/user";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Flag from "lucide-react/dist/esm/icons/flag";
import Shield from "lucide-react/dist/esm/icons/shield";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@/hooks/useReactQueryReplacement";
import LostFoundMiniMap from "./LostFoundMiniMap";
import LostFoundImageUploader from "./LostFoundImageUploader";
import type { LostFoundItem } from "@/routes/lost-found";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemDetailModalProps {
  item: LostFoundItem;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

interface ClaimEntry {
  id: string;
  finder_id: string;
  status: string;
  verification_nonce: string | null;
  created_at: string;
  profiles?: { full_name: string | null; handle: string | null } | null;
}

interface CommentEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string | null; handle: string | null } | null;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  actor_name: string;
  timestamp: string;
  details?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function statusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-lime text-black";
    case "resolved":
      return "bg-peach text-black";
    case "pending":
      return "bg-amber-200 text-amber-900";
    case "accepted":
      return "bg-green-200 text-green-900";
    case "rejected":
      return "bg-red-200 text-red-900";
    default:
      return "bg-cream text-black/60";
  }
}

// ─── Activity Timeline ────────────────────────────────────────────────────────

function ActivityTimeline({ logs }: { logs: ActivityLogEntry[] }) {
  if (logs.length === 0) return null;

  return (
    <div className="space-y-0">
      {logs.map((log, i) => (
        <div key={log.id} className="flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="h-2.5 w-2.5 rounded-full border-2 border-black bg-white mt-1.5" />
            {i < logs.length - 1 && <div className="w-px flex-1 bg-black/10" />}
          </div>
          <div className="pb-4 flex-1">
            <p className="text-xs font-bold text-black">{log.action}</p>
            <p className="text-[10px] text-black/50 mt-0.5">
              by <span className="font-semibold text-black/70">{log.actor_name}</span> — {formatTimeAgo(log.timestamp)}
            </p>
            {log.details && <p className="text-[10px] text-black/40 mt-0.5">{log.details}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Detail Modal ────────────────────────────────────────────────────────

export default function ItemDetailModal({ item, open, onClose, onRefresh }: ItemDetailModalProps) {
  const supabase = createClient();
  const { user } = useAuthHydration();

  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "claims" | "activity">("details");
  const [showReportDialog, setShowReportDialog] = useState(false);

  const isOwner = user?.id === item.user_id;

  // ── Fetch comments ───────────────────────────────────────────────────────────
  const { data: comments = [], refetch: refetchComments } = useQuery<CommentEntry[]>({
    queryKey: ["lf_comments", item.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lost_found_comments")
        .select("*, profiles(full_name, handle)")
        .eq("lost_found_item_id", item.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CommentEntry[];
    },
    enabled: open,
  });

  // ── Fetch claims with timestamps ─────────────────────────────────────────────
  const claims: ClaimEntry[] = (item.lost_item_claims as ClaimEntry[]) || [];

  // ── Activity log (derived from item state + claims) ──────────────────────────
  const activityLogs: ActivityLogEntry[] = [
    {
      id: "created",
      action: `Item reported as ${item.type === "lost" ? "LOST" : "FOUND"}`,
      actor_name: item.profiles?.full_name || "Anonymous",
      timestamp: item.created_at,
      details: item.location ? `at ${item.location}` : undefined,
    },
    ...claims.map((c) => ({
      id: c.id,
      action: c.status === "accepted" ? "Claim accepted" : c.status === "rejected" ? "Claim rejected" : "Claim submitted",
      actor_name: c.profiles?.full_name || "A student",
      timestamp: item.updated_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // ── Comment mutation ─────────────────────────────────────────────────────────
  const { mutate: postComment, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (!commentText.trim()) throw new Error("Comment cannot be empty");
      const { error } = await supabase.from("lost_found_comments").insert({
        lost_found_item_id: item.id,
        user_id: user.id,
        content: commentText.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      toast.success("Comment posted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Claim mutation ───────────────────────────────────────────────────────────
  const { mutate: claimItem } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("lost_item_claims").insert({
        lost_item_id: item.id,
        finder_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Claim submitted! Waiting for owner to respond.");
      onRefresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Share handler ────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/lost-found#${item.id}`;
    if (navigator.share) {
      navigator.share({ title: `${item.type === "lost" ? "Lost" : "Found"}: ${item.title}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }, [item]);

  // ── Report handler ───────────────────────────────────────────────────────────
  const handleReport = useCallback(async () => {
    try {
      const { error } = await supabase.from("lost_found_reports").insert({
        lost_found_item_id: item.id,
        reporter_id: user?.id,
        reason: "inappropriate",
      });
      if (error) throw error;
      toast.success("Report submitted. Our team will review it.");
      setShowReportDialog(false);
    } catch {
      toast.error("Failed to submit report.");
    }
  }, [item.id, user?.id, supabase]);

  // ── Active bounty ────────────────────────────────────────────────────────────
  const activeBounty = item.lost_item_bounties?.find((b: any) => b.status === "escrow");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="neu-border max-h-[90vh] overflow-y-auto bg-white sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border-2 border-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                  item.type === "lost" ? "bg-peach" : "bg-lime"
                }`}
              >
                {item.type === "lost" ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                {item.type}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold text-black/70 ring-1 ring-black/10">
                <Tag className="h-3 w-3" />
                {item.category}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase border border-black/20 ${statusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <button onClick={onClose} className="text-black/40 hover:text-black" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <DialogTitle className="font-mono text-xl font-black uppercase text-black pr-6">
            {item.title}
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        {item.image_url && (
          <div className="overflow-hidden rounded-lg border-2 border-black">
            <img src={item.image_url} alt={item.title} className="w-full max-h-[300px] object-cover" />
          </div>
        )}

        {/* Bounty Banner */}
        {activeBounty && item.bounty_amount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3">
            <Coins className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-amber-800">
                Active Bounty: {item.bounty_amount} ConnectCoins
              </p>
              <p className="text-[10px] text-amber-600">
                Funds held in escrow. Will be released upon verified return.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b-2 border-black/10">
          {(["details", "claims", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-mono font-black uppercase transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-black text-black"
                  : "border-transparent text-black/40 hover:text-black/60"
              }`}
            >
              {tab}
              {tab === "claims" && claims.length > 0 && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">
                  {claims.length}
                </span>
              )}
              {tab === "activity" && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">
                  {activityLogs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === "details" && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-black/70">{item.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {item.location && (
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-cream/50 px-3 py-2">
                    <MapPin className="h-4 w-4 text-black/50" />
                    <span className="text-xs font-mono text-black/70">{item.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-cream/50 px-3 py-2">
                  <Clock className="h-4 w-4 text-black/50" />
                  <span className="text-xs font-mono text-black/70">{formatTimeAgo(item.created_at)}</span>
                </div>
                {item.contact_info && (
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-cream/50 px-3 py-2">
                    <MessageCircle className="h-4 w-4 text-black/50" />
                    <span className="text-xs font-mono text-black/70">{item.contact_info}</span>
                  </div>
                )}
                {item.profiles?.full_name && (
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-cream/50 px-3 py-2">
                    <User className="h-4 w-4 text-black/50" />
                    <span className="text-xs font-mono text-black/70">{item.profiles.full_name}</span>
                  </div>
                )}
              </div>

              {/* Mini Map */}
              <LostFoundMiniMap
                latitude={item.lat as number}
                longitude={item.lng as number}
                title={item.title}
                floorDetails={item.floor_details}
                className="rounded-lg border-2 border-black overflow-hidden"
              />

              {/* QR for accepted claim */}
              {claims.some((c) => c.status === "accepted" && c.verification_nonce) && (
                <div className="rounded-lg bg-lime/20 border-2 border-black p-4 text-center">
                  <Shield className="mx-auto mb-2 h-6 w-6 text-black" />
                  <p className="text-xs font-bold uppercase text-black">
                    Verification QR — show to owner for bounty release
                  </p>
                  <div className="mx-auto mt-3 flex justify-center bg-white p-2 border-2 border-black rounded-lg w-max">
                    <QRCodeSVG
                      value={`lost-found://verify/${claims.find((c) => c.status === "accepted")?.verification_nonce}`}
                      size={140}
                    />
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-black uppercase text-black/50">
                  Comments ({comments.length})
                </h4>
                {comments.length === 0 && (
                  <p className="text-xs text-black/30 font-mono">No comments yet. Be the first to help!</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg border border-black/10 bg-cream/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-black/70">{c.profiles?.full_name || "Anonymous"}</span>
                      <span className="text-[9px] text-black/30">{formatTimeAgo(c.created_at)}</span>
                    </div>
                    <p className="mt-1 text-xs text-black/60">{c.content}</p>
                  </div>
                ))}
                {user && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && postComment()}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-md border-2 border-black bg-white px-3 py-2 text-xs font-mono placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Button
                      size="sm"
                      className="bg-lime border-2 border-black font-mono text-[10px] font-black uppercase"
                      onClick={() => postComment()}
                      disabled={isCommenting || !commentText.trim()}
                    >
                      Post
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "claims" && (
            <div className="space-y-3">
              {claims.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="mb-3 h-10 w-10 text-black/15" />
                  <p className="font-mono text-sm font-black uppercase text-black/30">No claims yet</p>
                  <p className="text-xs text-black/30">Be the first to claim this item</p>
                </div>
              ) : (
                claims.map((claim) => (
                  <div
                    key={claim.id}
                    className={`rounded-lg border-2 border-black p-3 ${
                      claim.status === "accepted" ? "bg-lime/20" : claim.status === "rejected" ? "bg-red-50" : "bg-cream/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white">
                          <User className="h-4 w-4 text-black/50" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-black">
                            {claim.profiles?.full_name || "A student"}
                          </p>
                          <p className="text-[10px] text-black/40">{formatTimeAgo(claim.created_at || item.updated_at)}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase border border-black/10 ${statusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Claim action button for finders */}
              {!isOwner && item.status === "active" && item.type === "lost" && user && (
                <Button
                  className="w-full bg-lime border-2 border-black font-mono font-black uppercase text-black hover:bg-lime/80"
                  onClick={() => claimItem()}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> I Found This Item
                </Button>
              )}
            </div>
          )}

          {activeTab === "activity" && <ActivityTimeline logs={activityLogs} />}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t-2 border-black/10 pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-black text-[10px]"
              onClick={handleShare}
            >
              <Share2 className="mr-1 h-3 w-3" /> Share
            </Button>
            {!isOwner && user && (
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-black text-[10px] text-red-600 hover:bg-red-50"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="mr-1 h-3 w-3" /> Report
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-black font-mono text-[10px] font-black uppercase"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        {/* Report Confirmation */}
        {showReportDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="bg-white border-2 border-black rounded-xl p-5 max-w-xs w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Flag className="mb-2 h-6 w-6 text-red-500" />
              <h4 className="font-mono text-sm font-black uppercase text-black">Report Item</h4>
              <p className="mt-1 text-xs text-black/60">
                Flag this item as inappropriate, spam, or suspicious. Our moderation team will review it.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-2 border-black text-[10px]"
                  onClick={() => setShowReportDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-500 border-2 border-black text-[10px] font-black text-white hover:bg-red-600"
                  onClick={handleReport}
                >
                  Submit Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
