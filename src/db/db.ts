import { text } from "body-parser";
import { Pool } from "pg";
import { getDB } from "../configs/app.config";
export interface IPGCredentials {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export default class PGConnection {
  private pool: Pool;

  constructor(creds: IPGCredentials) {
    this.pool = new Pool({ ...creds });
  }

  getPool(): Pool {
    return this.pool;
  }

  async ping(): Promise<Boolean> {
    await this.pool.query("SELECT NOW()");
    return true;
  }
}

// export default { query: (text: string, params: any[]) => pool.query(text, params) };
