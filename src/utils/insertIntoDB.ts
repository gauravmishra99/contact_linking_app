import { PoolClient, QueryResult } from "pg";
import { Contact } from "../interfaces/contact";

export default async function insertIntoDB(client: PoolClient, data: any) {
    const sql = `Insert into contact(phonenumber, email, linkedid, linkprecedence, createdat, updatedat) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
        data.phonenumber,
        data.email,
        data.linkedid,
        data.linkprecedence,
        data.createdat,
        data.updatedat,
    ];

    const res: QueryResult<any> = await client.query(sql, values);
    const rows: Array<Contact> = res.rows;
    return rows;
}
