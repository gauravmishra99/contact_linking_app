import { Express } from "express";
import pool from  '../db/db_init'

const appSetup = (app: Express) => {
  // set database connections

  pool.connect((err, client, done)=>{
    if(err) throw new Error(err.message);
    console.log("Connected to DB")
  })

  const APP_PORT = 3000;

  app.listen(APP_PORT, () => {
    console.log(`Server started on port ${APP_PORT}`);
  });
};

export default appSetup;
