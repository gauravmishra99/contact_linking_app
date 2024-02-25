import { Express, Request, Response, response } from "express";
import { Contact } from "../interfaces/contact";
import pool from "../db/db_init";
import { PoolClient, QueryResult } from "pg";
import { contactReponse } from "../interfaces/contactResponse";

const routerSetup = (app: Express) => {
    app.get("/", async (req: Request, res: Response) => {
        res.send("Hello Express APIvantage!");
    });

    app.post("/identify", async (req: Request, res: Response) => {
        try {
            const reqData = req.body;
            const email: string = reqData.email;
            const phoneNumber: string = reqData.phoneNumber;
            const client: PoolClient = await pool.connect();

            const sql = `SELECT * FROM contact where email = '${email}' OR phonenumber = '${phoneNumber}'`;
            const result: QueryResult<any> = await client.query(sql);
            const rows: Array<any> = result.rows;

            const contactResponse: contactReponse = {
                primaryContatctId: 0,
                emails: [],
                phoneNumbers: [],
                secondaryContactIds: [],
            };

            let countEmail = 0,
                countPhoneNumber = 0,
                primaryID = 0;

            for (let i = 0; i < rows.length; i++) {
                rows[i].linkprecedence == "primary"
                    ? (primaryID = rows[i].id)
                    : null;
                rows[i].email == email ? countEmail++ : null;
                rows[i].phonenumber == phoneNumber ? countPhoneNumber++ : null;
            }

            // if no record found against email or phone number, create new record

            if (countEmail == 0 && countPhoneNumber == 0) {
                // create new entry
                const time = new Date().toISOString();
                const data: Contact = {
                    email,
                    phonenumber: phoneNumber,
                    linkprecedence: "primary",
                    linkedid: undefined,
                    createdat: time,
                    updatedat: time,
                };

                const insertedData: Array<Contact> = await InsertIntoDB(
                    client,
                    data
                );

                await generateResponse(insertedData, contactResponse);
            } else if (countEmail == 0 || countPhoneNumber == 0) {
                // check from request body if phoneNumber or email is new, if yes, create new record as secondary
                const time = new Date().toISOString();
                const data: Contact = {
                    email,
                    phonenumber: phoneNumber,
                    linkprecedence: "secondary",
                    linkedid: primaryID,
                    createdat: time,
                    updatedat: time,
                };

                const insertedData: Array<any> = await InsertIntoDB(
                    client,
                    data
                );
                rows.push(insertedData[0]);
                await generateResponse(rows, contactResponse);
            }
            // check if more than one primary records exist, except the oldest record, mark all primary records as "secondary"

            client.release();
            res.send(contactResponse);
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    });
};
// handle insert into DataBase
async function InsertIntoDB(client: PoolClient, data: Contact) {
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
//generate response
async function generateResponse(data: any, contactResponse: contactReponse) {
    let primaryID;
    const secondaryContactIds = [];
    const emailSet: Set<string> = new Set(),
        phoneNumberSet: Set<string> = new Set();

    let primaryEmail = "",
        primaryPhoneNumber = "";

    for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        emailSet.add(datum.email);
        phoneNumberSet.add(datum.phonenumber);

        if (datum.linkprecedence == "primary") {
            primaryID = datum.id;
            primaryEmail = datum.email;
            primaryPhoneNumber = datum.phonenumber;
        } else {
            secondaryContactIds.push(datum.id);
        }
    }

    const emailArr = Array.from(emailSet);
    const phoneArr = Array.from(phoneNumberSet);

    for (let i = 0; i < emailArr.length; i++) {
        if (emailArr[i] == primaryEmail) {
            const temp = emailArr[i];
            emailArr[i] = emailArr[0];
            emailArr[0] = temp;
            break;
        }
    }

    for (let i = 0; i < phoneArr.length; i++) {
        if (phoneArr[i] == primaryPhoneNumber) {
            const temp = phoneArr[i];
            phoneArr[i] = phoneArr[0];
            phoneArr[0] = temp;
            break;
        }
    }

    contactResponse.primaryContatctId = primaryID;
    contactResponse.phoneNumbers = phoneArr;
    contactResponse.emails = emailArr;
    contactResponse.secondaryContactIds = secondaryContactIds;
}
export default routerSetup;
