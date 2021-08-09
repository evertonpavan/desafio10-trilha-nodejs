import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to show a user profile", async () => {

        await request(app)
            .post("/api/v1/users")
            .send({
                name: "Lionel Messi",
                email: "messi@messi.com",
                password: "thebest"
            })

        const user = await request(app)
            .post("/api/v1/sessions")
            .send({
                email: "messi@messi.com",
                password: "thebest"
            })

        const { token } = user.body;

        const response = await request(app)
            .get("/api/v1/profile")
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
        expect(response.body.id).toBe(user.body.user.id);
        expect(response.body.name).toBe(user.body.user.name);
        expect(response.body.email).toBe(user.body.user.email);
    })

    it("should not be able to show a nonexistent user profile", async () => {

        await request(app)
            .post("/api/v1/users")
            .send({
                name: "Neymar Jr",
                email: "neymar@jr.com",
                password: "brazil"
            })

        const authResponse = await request(app)
            .post("/api/v1/sessions")
            .send({
                email: "neymar@jr.com",
                password: "brazil"
            })

        const { token, user } = authResponse.body;

        await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

        const response = await request(app)
            .get("/api/v1/profile")
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(404);
    });


});
