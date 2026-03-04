import { prisma } from "../db/prisma";
export const addDataService = async (email: string, phoneNumber: string) => {
    try {
        const contactInDB = await prisma.contact.findMany({
            where: {
                OR: [
                    { email },
                    { phoneNumber }
                ]
            },
            orderBy: {
                createdAt: "asc"
            }
        })

        if (!contactInDB) {
            const newEntry = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber
                }
            })

            return {
                primaryContactId: newEntry.id,
                emails: [email],
                phoneNumbers: [phoneNumber],
                secondaryContactIds: []
            }
        }

        //contact exists linking needs to be done after the step
        const primaryContacts = contactInDB.filter(contact => contact.linkPrecedence === 'primary')

        const primary = primaryContacts[0];

        if (!primary) return;

        if (email === primary.email && phoneNumber === primary.phoneNumber) return 1;

        if (primaryContacts.length === 1) {
            const secondaryContact = await prisma.contact.create({
                // where: {
                //     id: primary.id
                // },
                data: {
                    email: (email !== primary.email ? email : primary.email),
                    phoneNumber: (phoneNumber !== primary.phoneNumber ? phoneNumber : primary.phoneNumber),
                    linkedId: primary.id,
                    linkPrecedence: 'secondary'
                }
            })

            return {
                primaryContactId: primary.id,
                emails: [email, primary.email],
                phoneNumbers: [phoneNumber, primary.phoneNumber],
                secondaryContactIds: [secondaryContact.id]
            }
        }




    } catch (error) {
        console.log(error);
        return -1;
    }
}
