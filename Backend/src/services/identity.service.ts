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

        //contact exists linking needs to be done after the step
        const primaryContacts = contactInDB.filter(contact => contact.linkPrecedence === 'primary')

        const primary = primaryContacts[0];

        if (!primary) return;

        if (email === primary.email && phoneNumber === primary.phoneNumber) return 1;

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
                    in: remainingPrimaries.map((p) => p.id)
                }
            },
            data: {
                linkedId: primary.id
            }
        })

        const updatedData = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primary.id },
                    { linkedId: primary.id }
                ]
            }
        })

        const mergedEmails = [...new Set(updatedData.map(c => c.email).filter(Boolean))]
        const mergedPhoneNumbers = [...new Set(updatedData.map(c => c.phoneNumber).filter(Boolean))]
        const mergedSecondaryContactIds =
            updatedData.filter(c => c.linkPrecedence === "secondary").map(c => c.id)

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