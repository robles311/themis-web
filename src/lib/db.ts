import { Pool, QueryResult, QueryResultRow } from "pg";

let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    const url = process.env.DATABASE_URL;
    poolInstance = new Pool({
      connectionString: url || undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    poolInstance.on("error", (err: Error) => {
      console.error("[db] Unexpected pool error:", err.message);
    });
  }
  return poolInstance;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    const result = await getPool().query<T>(text, params);
    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    console.error(`[db] Query failed: ${message}`);
    throw err;
  }
}

export async function isConnected(): Promise<boolean> {
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  try {
    if (poolInstance) {
      await poolInstance.end();
      poolInstance = null;
    }
  } catch (err) {
    console.error("[db] Error closing pool:", err);
  }
}
