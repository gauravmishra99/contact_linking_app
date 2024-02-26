import { PoolClient, QueryResult } from "pg";

export default async function fetchRows(
    client: PoolClient,
    email: string,
    phoneNumber: string
) {
    const fetchAllSQL = `select * from fecthall('${email}', '${phoneNumber}');`;
    const result: QueryResult<any> = await client.query(fetchAllSQL);
    const rows: Array<any> = result.rows;
    return rows;
}
