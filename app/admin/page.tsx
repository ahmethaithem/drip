import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { AdminDashboard } from "@/components/admin-dashboard";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"لوحة الطلبات | DRIP EGYPT",robots:{index:false,follow:false}};
export default async function AdminPage(){const user=await requireChatGPTUser("/admin");return <main className="page-shell shell admin-page"><div className="admin-heading"><div><p className="kicker">DRIP EGYPT · ADMIN</p><h1 className="page-title">إدارة الطلبات</h1><p className="page-intro">متصل باسم {user.displayName}</p></div><a className="button button-outline no-print" href={chatGPTSignOutPath("/")} target="_top">تسجيل الخروج</a></div><AdminDashboard/></main>;}

