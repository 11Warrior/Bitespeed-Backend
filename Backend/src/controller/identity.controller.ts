import { prisma } from "../db/prisma";
import { Request, Response } from "express";
import { addDataService } from "../services/identity.service";

export const addData = async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;
        const result = await addDataService(email, phoneNumber);

        return res.status(200).json({ contact: result })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error });
    }
}
