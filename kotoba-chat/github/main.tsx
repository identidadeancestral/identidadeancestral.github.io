import { createRoot } from "react-dom/client";
import AccountGateway from "../app/account-gateway";
import { API_BASE } from "../lib/frontend-config";
import "../app/globals.css";
createRoot(document.getElementById("root")!).render(<AccountGateway apiOrigin={API_BASE}/>);
