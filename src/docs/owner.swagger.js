/**
 * @swagger
 * tags:
 *   - name: Owner Auth
 *     description: |
 *       ## 🟡 Owner Registration Flow (5 steps)
 *
 *       | Step | Endpoint | What to send |
 *       |------|----------|-------------|
 *       | 1 | `POST /auth/signup` | `role: "owner"`, firstName, surname, phoneNumber, email |
 *       | 2 | `POST /auth/complete-profile` | email, location, propertyTypes, listingIntent, ownerType |
 *       | 3 | `POST /auth/verify-identity` | email + file uploads (profilePicture, governmentId, ninCacDocument) — **multipart/form-data** |
 *       | 4 | `GET /auth/verify/:code` | 6-digit OTP from email (fallback: 123456) |
 *       | 5 | `POST /auth/set-password` | email, password, confirmPassword |
 *
 *       **After Step 5**, owner receives access_token and is logged in.
 *       **Note:** OTP is sent at Step 3 (after identity upload), NOT at Step 1.
 *
 *       ---
 *       ### Step 1 body:
 *       ```json
 *       {
 *         "role": "owner",
 *         "firstName": "Jane",
 *         "surname": "Smith",
 *         "phoneNumber": "08098765432",
 *         "email": "jane@example.com"
 *       }
 *       ```
 *
 *       ### Step 2 body:
 *       ```json
 *       {
 *         "email": "jane@example.com",
 *         "location": "Lagos",
 *         "propertyTypes": "apartment, house",
 *         "listingIntent": "rent",
 *         "ownerType": "individual"
 *       }
 *       ```
 *
 *       ### Step 3 (multipart/form-data):
 *       - `email`: jane@example.com
 *       - `profilePicture`: [file upload]
 *       - `governmentId`: [file upload] — passport, driver's license, or national ID
 *       - `ninCacDocument`: [file upload] — NIN or CAC document
 *
 *       ### Step 5 body:
 *       ```json
 *       {
 *         "email": "jane@example.com",
 *         "password": "Password@123",
 *         "confirmPassword": "Password@123"
 *       }
 *       ```
 *
 *   - name: Owner Profile
 *     description: |
 *       ## 🟡 Owner Profile (after login)
 *
 *       | Action | Endpoint | Auth |
 *       |--------|----------|------|
 *       | Create profile | `POST /profile/owner` | Bearer token |
 *       | Get my profile | `GET /profile/me` | Bearer token |
 *       | Update profile | `PUT /profile` | Bearer token |
 *
 *       ### Create Profile body:
 *       ```json
 *       {
 *         "firstName": "Jane",
 *         "surname": "Smith",
 *         "phoneNumber": "08098765432",
 *         "stateOfResidence": "Lagos",
 *         "gender": "female",
 *         "dateOfBirth": "1990-03-20",
 *         "agencyCompanyName": "Smith Properties",
 *         "agentLicenseNumber": "LIC-12345"
 *       }
 *       ```
 */
