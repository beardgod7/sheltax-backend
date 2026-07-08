/**
 * @swagger
 * tags:
 *   - name: Seeker Auth
 *     description: |
 *       ## 🔵 Seeker Registration Flow (3 steps)
 *
 *       | Step | Endpoint | What to send |
 *       |------|----------|-------------|
 *       | 1 | `POST /auth/signup` | `role: "seeker"`, firstName, surname, phoneNumber, email, ninVerification |
 *       | 2 | `GET /auth/verify/:code` | 6-digit OTP from email (fallback: 123456) |
 *       | 3 | `POST /auth/set-password` | email, password, confirmPassword |
 *
 *       **After Step 3**, seeker receives access_token and is logged in.
 *
 *       ---
 *       ### Example Step 1 body:
 *       ```json
 *       {
 *         "role": "seeker",
 *         "firstName": "John",
 *         "surname": "Doe",
 *         "phoneNumber": "08012345678",
 *         "email": "john@example.com",
 *         "ninVerification": "12345678901"
 *       }
 *       ```
 *
 *       ### Example Step 3 body:
 *       ```json
 *       {
 *         "email": "john@example.com",
 *         "password": "Password@123",
 *         "confirmPassword": "Password@123"
 *       }
 *       ```
 *
 *   - name: Seeker Profile
 *     description: |
 *       ## 🔵 Seeker Profile (after login)
 *
 *       | Action | Endpoint | Auth |
 *       |--------|----------|------|
 *       | Create profile | `POST /profile/seeker` | Bearer token |
 *       | Get my profile | `GET /profile/me` | Bearer token |
 *       | Update profile | `PUT /profile` | Bearer token |
 *
 *       ### Create Profile body:
 *       ```json
 *       {
 *         "firstName": "John",
 *         "surname": "Doe",
 *         "phoneNumber": "08012345678",
 *         "stateOfResidence": "Lagos",
 *         "gender": "male",
 *         "dateOfBirth": "1995-06-15",
 *         "ninVerification": "12345678901"
 *       }
 *       ```
 *       **Note:** emailAddress is auto-populated from registration — do NOT send it.
 */
