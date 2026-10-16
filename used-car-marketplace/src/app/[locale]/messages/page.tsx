import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// รายการห้องแชตทั้งหมดของผู้ใช้
export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const t = await getTranslations("chat");

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true, images: { take: 1, orderBy: { order: "asc" } } } },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="mx-auto max-w-2xl py-4">
      <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
      {conversations.length === 0 && <p className="text-gray-500">{t("empty")}</p>}
      <div className="divide-y rounded-xl border bg-white">
        {conversations.map((c) => (
          <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
              {c.listing.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.listing.images[0].url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.listing.title}</p>
              <p className="truncate text-sm text-gray-500">{c.messages[0]?.body ?? t("start")}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
