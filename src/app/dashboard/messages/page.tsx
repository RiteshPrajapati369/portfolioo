"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Trash2,
  CheckCircle,
  Archive,
  Reply,
  Clock,
  Globe,
  Loader2,
  ShieldCheck,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { feedback } from "@/lib/feedback";
import { formatDate } from "@/lib/utils";
import type { ContactMessage } from "@/types";

export default function MessagesDashboardPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setMessages(data);
      setSelectedMessage((prev) => (prev ? prev : data[0] || null));
    }
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      feedback.success("Status Updated", `Marked as ${newStatus}`);
      await loadMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (err: any) {
      feedback.error("Failed to Update", err?.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return;

    const supabase = createClient();
    try {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
      feedback.success("Message Deleted", "Message permanently removed.");
      setSelectedMessage(null);
      await loadMessages();
    } catch (err: any) {
      feedback.error("Delete Failed", err?.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Loading inbox...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            Contact Messages & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
            Review and dispatch replies to inquiries from the public contact channel
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1 text-xs font-mono">
          {["all", "new", "read", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === st
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Split view: List & Detail */}
      {messages.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs font-mono space-y-2">
          <Mail className="w-8 h-8 text-primary mx-auto" />
          <p>No messages match the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-5 rounded-2xl border border-border bg-card/60 divide-y divide-border overflow-hidden shadow-sm h-[650px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (msg.status === "new") {
                    updateStatus(msg.id, "read");
                  }
                }}
                className={`p-4 cursor-pointer transition-colors space-y-1.5 ${
                  selectedMessage?.id === msg.id
                    ? "bg-background border-l-4 border-l-primary"
                    : "hover:bg-background/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-foreground truncate max-w-[150px]">
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(msg.created_at)}
                  </span>
                </div>

                <div className="text-xs font-semibold text-foreground truncate">{msg.subject}</div>

                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="truncate max-w-[180px]">{msg.email}</span>
                  {msg.status === "new" && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Detail View */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-6 shadow-sm">
                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                        selectedMessage.subject
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>

                    <button
                      onClick={() =>
                        updateStatus(
                          selectedMessage.id,
                          selectedMessage.status === "archived" ? "read" : "archived"
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-card font-mono text-xs text-foreground transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {selectedMessage.status === "archived" ? "Unarchive" : "Archive"}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sender & Subject Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>
                      Received: {new Date(selectedMessage.created_at).toLocaleString()}
                    </span>
                    <span className="uppercase font-bold text-primary">
                      Status: {selectedMessage.status}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold font-mono text-foreground">
                    {selectedMessage.subject}
                  </h2>

                  <div className="p-3 rounded-xl bg-background border border-border text-xs font-mono space-y-1">
                    <div>
                      <span className="text-muted-foreground">From: </span>
                      <span className="font-semibold text-foreground">{selectedMessage.name}</span>{" "}
                      &lt;
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                      &gt;
                    </div>
                    {selectedMessage.ip_address && (
                      <div className="text-[11px] text-muted-foreground">
                        <span>Client IP (Cloudflare): </span>
                        <code className="text-primary">{selectedMessage.ip_address}</code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-5 rounded-xl bg-background/60 border border-border/80 text-sm font-sans leading-relaxed text-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center rounded-2xl border border-dashed border-border text-xs font-mono text-muted-foreground">
                Select a message from the list to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
