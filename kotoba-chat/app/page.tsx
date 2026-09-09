import AccountGateway from "./account-gateway";
import { redirect } from "next/navigation";
import { FRONTEND_URL } from "@/lib/frontend-config";
import { backendMode } from "./api/backend-mode";
export const dynamic="force-dynamic";
export default function Home(){if(backendMode()==="supabase")redirect(FRONTEND_URL);return <AccountGateway/>;}
