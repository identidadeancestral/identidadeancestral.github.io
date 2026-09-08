import { createRoot } from "react-dom/client";
import AccountGateway from "../app/account-gateway";
import { SERVER_ORIGIN } from "../lib/frontend-config";
import "../app/globals.css";
createRoot(document.getElementById("root")!).render(<AccountGateway apiOrigin={SERVER_ORIGIN}/>);
