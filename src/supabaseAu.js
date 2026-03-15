import { createClient } from "@supabase/supabase-js";
export const supabaseAu = createClient(
  "https://wrkjckponkkhsaylbipi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indya2pja3BvbmtraHNheWxiaXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyODU4MSwiZXhwIjoyMDg4ODA0NTgxfQ.ZBsSQLcgiPo0L9zg21gqvuTCQsTJewYUqJJbUQV2FQc"
);
