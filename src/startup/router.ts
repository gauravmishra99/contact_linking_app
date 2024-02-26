import { Express, Request, Response } from "express";
import { Contact } from "../interfaces/contact";
import pool from "../db/db_init";
import { PoolClient, QueryResult } from "pg";
import { contactReponse } from "../interfaces/contactResponse";
import updateSecondaryRecords from "../utils/updateSecondaryRecords";
import insertIntoDB from "../utils/insertIntoDB";
import generateResponse from "../utils/generateResponse";
import fetchRows from "../utils/fetchPrimarySecondaryRows";

const routerSetup = (app: Express) => {
    app.post("/identify", async (req: Request, res: Response) => {
        try {
            const reqData = req.body;
            const email: string = reqData.email;
            const phoneNumber: string = reqData.phoneNumber;
            const client: PoolClient = await pool.connect();

            // fetching all primary and secondary rows related to email and phoneNumber
            const rows = await fetchRows(client, email, phoneNumber);

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
                if (primaryID == 0 && rows[i].linkprecedence == "primary")
                    primaryID = rows[i].id;
                rows[i].email == email ? countEmail++ : null;
                rows[i].phonenumber == phoneNumber ? countPhoneNumber++ : null;
            }

            // if no record found against email or phone number, create new record

            if (countEmail == 0 && countPhoneNumber == 0) {
                // create new entry
                const time = new Date().toISOString();
                const data = {
                    email,
                    phonenumber: phoneNumber,
                    linkprecedence: "primary",
                    linkedid: undefined,
                    createdat: time,
                    updatedat: time,
                };

                const insertedData: Array<Contact> = await insertIntoDB(
                    client,
                    data
                );

                await generateResponse(insertedData, contactResponse);
            } else if (countEmail == 0 || countPhoneNumber == 0) {
                // check from request body if phoneNumber or email is new, if yes, create new record as secondary
                if (phoneNumber != undefined && email != undefined) {
                    const time = new Date().toISOString();
                    const data = {
                        email,
                        phonenumber: phoneNumber,
                        linkprecedence: "secondary",
                        linkedid: primaryID,
                        createdat: time,
                        updatedat: time,
                    };

                    const insertedData: Array<any> = await insertIntoDB(
                        client,
                        data
                    );
                    rows.push(insertedData[0]);
                }

                await generateResponse(rows, contactResponse);
            } else {
                // check if more than one primary records exist then except the oldest record,
                // mark all primary records as "secondary"
                const secondaryRecords: Array<Contact> = [],
                    primaryRecords: Array<Contact> = [];

                rows.forEach((row: Contact) => {
                    row.linkprecedence == "secondary"
                        ? secondaryRecords.push(row)
                        : primaryRecords.push(row);
                });

                // modifying all primary records except first to secondary
                const rowID: Array<number> = [];
                for (let i = 1; i < primaryRecords.length; i++) {
                    const row: Contact = primaryRecords[i];
                    rowID.push(row.id);
                    row.linkprecedence = "secondary";
                    secondaryRecords.push(row);
                }

                for (let i = 0; i < secondaryRecords.length; i++) {
                    secondaryRecords[i].linkedid != primaryID
                        ? rowID.push(secondaryRecords[i].id)
                        : null;
                }

                // if more than one primary records exist, then the db will be updated
                if (primaryRecords.length > 1)
                    await updateSecondaryRecords(
                        client,
                        rowID,
                        primaryRecords[0].id
                    );
                const data = [primaryRecords[0], ...secondaryRecords];
                await generateResponse(data, contactResponse);
            }

            client.release();
            res.send(contactResponse);
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    });
};

export default routerSetup;
