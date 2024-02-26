import { PoolClient } from "pg";

export default async function updateSecondaryRecords(
    client: PoolClient,
    rowID: number[],
    primaryID: number
) {
    const time = new Date().toISOString();
    let sql = `Update contact set linkprecedence = 'secondary', linkedid = $1, updatedat = $2 where id in (`;
    rowID.forEach((id) => {
        sql += id + ",";
    });
    const sqlSize = sql.length;
    const charArr = [...sql];
    charArr[sqlSize - 1] = ")";
    sql = charArr.join("");

    await client.query(sql, [primaryID, time]);
}
