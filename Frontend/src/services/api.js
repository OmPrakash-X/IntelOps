// Compatibility shim — the friend's feature files import from here.
// This re-exports the configured axios instance so all imports work.
import { api } from "@/lib/axios";

export default api;
