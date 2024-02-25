import express from "express";
import dotenv from "dotenv";
dotenv.config({path : __dirname + '/.env'});

import appSetup from "./startup/init";
import securitySetup from "./startup/security";
import routerSetup from "./startup/router";

const app = express();

appSetup(app);
securitySetup(app, express);
routerSetup(app);