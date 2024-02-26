import { contactReponse } from "../interfaces/contactResponse";

export default async function generateResponse(data: any, contactResponse: contactReponse) {
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