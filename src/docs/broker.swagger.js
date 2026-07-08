/**
 * @swagger
 * tags:
 *   - name: Broker Auth
 *     description: |
 *       ## 🟢 Broker Registration Flow (5 steps)
 *
 *       | Step | Endpoint | What to send |
 *       |------|----------|-------------|
 *       | 1 | `POST /auth/signup` | `role: "broker"`, brokerProfileType, firstName, surname, phoneNumber, email, yearsOfExperience, bio, specialization |
 *       | 2 | `POST /auth/complete-profile` | email, agencyCompanyName, companyYearsOfExistence, operatingLocations, companySize, portfolioSummary |
 *       | 3 | `POST /auth/verify-identity` | email + file uploads (profilePicture, governmentId, ninCacDocument) — **multipart/form-data** |
 *       | 4 | `GET /auth/verify/:code` | 6-digit OTP from email (fallback: 123456) |
 *       | 5 | `POST /auth/set-password` | email, password, confirmPassword |
 *
 *       **After Step 5**, broker receives access_token and is logged in.
 *       **Note:** OTP is sent at Step 3 (after identity upload), NOT at Step 1.
 *
 *       ---
 *       ### Step 1 body:
 *       ```json
 *       {
 *         "role": "broker",
 *         "brokerProfileType": "Freelance Agent/Independent Broker",
 *         "firstName": "Mike",
 *         "surname": "Johnson",
 *         "phoneNumber": "08033445566",
 *         "email": "mike@brokerage.com",
 *         "yearsOfExperience": 5,
 *         "bio": "Experienced broker specializing in luxury properties",
 *         "specialization": "Residential, Commercial"
 *       }
 *       ```
 *
 *       ### Step 2 body:
 *       ```json
 *       {
 *         "email": "mike@brokerage.com",
 *         "agencyCompanyName": "Mike Properties Ltd",
 *         "companyYearsOfExistence": "5 years",
 *         "operatingLocations": "Lagos, Abuja",
 *         "companySize": "1-10",
 *         "portfolioSummary": "Closed over 50 deals in 2023"
 *       }
 *       ```
 *
 *       ### Step 3 (multipart/form-data):
 *       - `email`: mike@brokerage.com
 *       - `profilePicture`: [file upload] — profile photo or company logo
 *       - `governmentId`: [file upload] — passport, driver's license, or national ID
 *       - `ninCacDocument`: [file upload] — NIN or CAC document
 *
 *       ### Step 5 body:
 *       ```json
 *       {
 *         "email": "mike@brokerage.com",
 *         "password": "Password@123",
 *         "confirmPassword": "Password@123"
 *       }
 *       ```
 *
 *   - name: Broker Profile
 *     description: |
 *       ## 🟢 Broker Profile (after login)
 *
 *       | Action | Endpoint | Auth |
 *       |--------|----------|------|
 *       | Create profile | `POST /profile/broker` | Bearer token |
 *       | Get my profile | `GET /profile/me` | Bearer token |
 *       | Update profile | `PUT /profile` | Bearer token |
 *
 *       ### Create Profile body:
 *       ```json
 *       {
 *         "firstName": "Mike",
 *         "surname": "Johnson",
 *         "phoneNumber": "08033445566",
 *         "stateOfResidence": "Lagos",
 *         "gender": "male",
 *         "dateOfBirth": "1988-11-08",
 *         "agencyCompanyName": "Mike Properties Ltd",
 *         "agentLicenseNumber": "BRK-98765"
 *       }
 *       ```
 */
