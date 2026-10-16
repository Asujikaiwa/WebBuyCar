"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { pusherClient } from "@/lib/pusher-client";

interface Msg {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

// ห้องแชต real-time — โหลดประวัติ + subscribe Pusher เพื่อรับข้อความใหม่ทันที
export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const t = useTranslations("chat");
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // โหลดประวัติข้อความครั้งแรก
  useEffect(() => {
    fetch(`/api/conversations/${params.id}/messages`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setMessages(data));
  }, [params.id]);

  // subscribe channel เพื่อรับข้อความ real-time
  useEffect(() => {
    const channel = pusherClient.subscribe(`private-conversation-${params.id}`);
    channel.bind("new-message", (msg: Msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation-${params.id}`);
    };
  }, [params.id]);

  // เลื่อนลงล่างสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const body = text;
    setText("");
    await fetch(`/api/conversations/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    // ข้อความจะเด้งเข้ามาเองผ่าน Pusher event
  }

  const myId = session?.user?.id;

  return (
    <div className="mx-auto flex h-[70vh] max-w-2xl flex-col rounded-xl border bg-white">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === myId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
              m.senderId === myId ? "bg-brand text-white" : "bg-gray-100"
            }`}>
              {m.body}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("placeholder")}
          className="flex-1 rounded-md border px-3 py-2" />
        <button className="rounded-md bg-brand px-5 font-medium text-white">{t("send")}</button>
      </form>
    </div>
  );
}
