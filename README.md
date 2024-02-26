
# Contact Linking Application

Contact linking application can be used to identify users with multiple emails and phone numbers. The application links the contact details and return an contact object containing primary and secondary contact information.




## Setup

After cloning the repository into your local machine, run the following command to install the dependencies

```bash
  cd contact_linking_app
  npm install
```

## Setup DB

I have used PostgreSQL for this project and have included an setup.sql file which can be used to setup the table and functions of PostgreSQL used in application.
```
    1. Open the setup.sql in your IDE/Text Editor
    2. Copy the content and paste in your PostgreSQL Query tool
    3. Execute the query to create the table and PostgreSQL function used in the project.
```

Please ensure to setup your local PostgreSQL instance first

## Configure Environment variables

Create a .env file under src directory and add the following inside it.

```
    DB_CONNECTION_URI ="postgres://[YourUserName]:[YourPassword]@[YourHostname]:5432/[YourDatabaseName]"
```
Replace the placeholders with your respective details 
    
