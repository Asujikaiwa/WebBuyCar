import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link / useRouter / usePathname เวอร์ชันที่เติม locale prefix ให้อัตโนมัติ
// ใช้แทน next/link และ next/navigation ทั่วทั้งแอป
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
