import { Pool } from "pg";
import PGConnection, { IPGCredentials } from "./db";

class Connection {
  private pgPools: PGConnection;

  constructor() {}

  async connect(connections: IPGCredentials) {
    this.pgPools = new PGConnection(connections);
    await this.pgPools.ping();
    console.log("DB Connected Successfully");
  }

  getConnection(): Pool {
    return this.pgPools.getPool();
  }
}
export default new Connection();
