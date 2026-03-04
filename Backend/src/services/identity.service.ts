import { Contact } from "@prisma/client";
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

        if (contactInDB.length === 0) {
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

        const primaryContacts = contactInDB.filter((contact: Contact) => contact.linkPrecedence === 'primary')

        const primary = primaryContacts[0];

        if (!primary) return;

        if (email === primary.email && phoneNumber === primary.phoneNumber) return 1;

        if (primaryContacts.length > 1) {
            //multiple primary contacts case merge the later ones
            const remainingPrimaries = primaryContacts.slice(1);

            for (const remPrimary of remainingPrimaries) {
                await prisma.contact.update({
                    where: {
                        id: remPrimary.id
                    },
                    data: {
                        linkedId: primary.id,
                        linkPrecedence: 'secondary'
                    }
                })
            }

            await prisma.contact.updateMany({
                where: {
                    linkedId: {
                        in: remainingPrimaries.map((p: Contact) => p.id)
                    }
                },
                data: {
                    linkedId: primary.id
                }
            })
        }

        if (primaryContacts.length === 1) {
            const secondaryContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
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

        const updatedData = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primary.id },
                    { linkedId: primary.id }
                ]
            }
        })

        const mergedEmails = [...new Set(updatedData.map((c: Contact) => c.email).filter(Boolean))]
        const mergedPhoneNumbers = [...new Set(updatedData.map((c: Contact) => c.phoneNumber).filter(Boolean))]
        const mergedSecondaryContactIds =
            updatedData.filter((c: Contact) => c.linkPrecedence === "secondary").map((c: Contact) => c.id)

        return {
            primaryContactId: primary.id,
            emails: mergedEmails,
            phoneNumbers: mergedPhoneNumbers,
            secondaryContactIds: mergedSecondaryContactIds
        }

    } catch (error) {
        console.log(error);
        return -1;
    }
}