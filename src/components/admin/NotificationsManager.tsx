"use client";

import { useCallback, useMemo, useState } from "react";
import { Bell, Check, MessageSquareText, Search, Smartphone } from "lucide-react";
import { usePhase15 } from "@/components/providers/Phase15Provider";
import {
  buildNotificationFeed,
  CHANNEL_LABELS,
  notificationsForChannel,
  type NotificationChannel,
} from "@/lib/admin/notifications";

const CHANNEL_ICONS: Record<NotificationChannel, typeof MessageSquareText> = {
  whatsapp: MessageSquareText,
  sms: Smartphone,
  email: Check,
};

const CHANNEL_COLORS: Record<NotificationChannel, string> = {
  whatsapp: "bg-[#25D366]/15 text-[#128C7E]",
  sms: "bg-sky-100 text-sky-700",
  email: "bg-violet-100 text-violet-800",
};

/**
 * /admin/notifications — a READ-ONLY simulated notification feed, derived from
 * each order lifecycle. Real WhatsApp/SMS/email isn't wired in preview, so in
 * place of an outbox we render the exact messages a customer would have
 * received at every stage their order has reached. When you move an order
 * forward on /admin/orders, new entries appear here automatically.
 */
export function NotificationsManager() {
  const { orders } = usePhase15();
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | "all">("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const events = useMemo(() => buildNotificationFeed(orders), [orders]);

  const filtered = useMemo(() => {
    const byChannel = notificationsForChannel(events, channelFilter);
    const q = orderQuery.trim().toLowerCase();
    if (!q) return byChannel;
    return byChannel.filter(
      (event) =>
        event.orderNumber.toLowerCase().includes(q) ||
        event.customerName.toLowerCase().includes(q),
    );
  }, [events, channelFilter, orderQuery]);

  const stats = useMemo(() => {
    const byChannel = events.reduce<Record<NotificationChannel, number>>(
      (acc, event) => {
        acc[event.channel] += 1;
        return acc;
      },
      { whatsapp: 0, sms: 0, email: 0 },
    );
    return {
      total: events.length,
      byChannel,
    };
  }, [events]);

  const activeOrders = useMemo(
    () => new Set(events.map((event) => event.orderId)).size,
    [events],
  );

  const handleSearch = useCallback((value: string) => {
    setOrderQuery(value);
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Bell size={13} /> Notifications
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Simulated notification feed
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {stats.total} messages across {activeOrders} orders. The feed is
            derived live from each order&apos;s lifecycle — move a status in
            Orders and the matching confirm/preparing/out-for-delivery/delivered
            message appears here.
          </p>
        </div>
      </div>

      {/* Channel stats */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-ink/10 bg-white/80 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">
            Total sent
          </p>
          <p className="mt-1 font-display text-2xl text-ink">{stats.total}</p>
        </div>
        {(["whatsapp", "sms", "email"] as NotificationChannel[]).map((channel) => {
          const Icon = CHANNEL_ICONS[channel];
          return (
            <button
              key={channel}
              type="button"
              onClick={() =>
                setChannelFilter(channelFilter === channel ? "all" : channel)
              }
              className={`rounded-xl border p-4 text-left shadow-sm transition ${
                channelFilter === channel
                  ? "border-gold bg-gold/10"
                  : "border-ink/10 bg-white/80 hover:border-gold/50"
              }`}
            >
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                <Icon size={12} /> {CHANNEL_LABELS[channel]}
              </p>
              <p className="mt-1 font-display text-2xl text-ink">
                {stats.byChannel[channel]}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={orderQuery}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search order number or customer…"
            aria-label="Search notifications"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "whatsapp", "sms", "email"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setChannelFilter(filter)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                channelFilter === filter
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/10 bg-white/70 text-ink-soft hover:border-gold/60"
              }`}
            >
              {filter === "all" ? "All channels" : CHANNEL_LABELS[filter]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-ink/10 bg-white/80 p-12 text-center shadow-sm">
          <Bell size={24} className="mx-auto mb-3 text-ink-soft/40" />
          <p className="font-display text-xl text-ink">Nothing to show yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            No notifications match this filter. Orders that reach at least
            &quot;received&quot; appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
          <ul className="divide-y divide-ink/5">
            {filtered.map((event) => {
              const Icon = CHANNEL_ICONS[event.channel];
              const open = showDetails === event.id;
              return (
                <li
                  key={event.id}
                  className="p-4 transition hover:bg-ivory-deep/30"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${CHANNEL_COLORS[event.channel]}`}>
                        <Icon size={15} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-semibold text-ink">{event.subject}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CHANNEL_COLORS[event.channel]}`}
                        >
                          {CHANNEL_LABELS[event.channel]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">
                        {event.orderNumber} · {event.customerName} ·{" "}
                        {new Date(event.sentAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetails(open ? null : event.id)}
                      aria-label={open ? "Hide message" : "Show message"}
                      className="text-xs font-bold text-sage-ink hover:underline"
                    >
                      {open ? "Hide" : "View message"}
                    </button>
                  </div>
                  {open && (
                    <div className="mt-3 rounded-lg bg-ivory-deep/60 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                        Template body
                      </p>
                      <p className="mt-2 rounded-md bg-white p-3 text-sm leading-6 text-ink-soft">
                        {event.body}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}