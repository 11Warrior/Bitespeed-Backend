import { Router } from "express";
import { addData } from "../controller/identity.controller";

const router: Router = Router();

router.post('/identity', addData);


export { router };