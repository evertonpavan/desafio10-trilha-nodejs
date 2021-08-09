import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to create a deposit", async () => {

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

        const token = user.body.token;

        const response = await request(app)
            .post("/api/v1/statements/deposit")
            .send({
                amount: 400,
                description: 'income',
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("user_id");
        expect(response.body).toHaveProperty("description", "income");
        expect(response.body).toHaveProperty("amount", 400);
        expect(response.body).toHaveProperty("type", "deposit");
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("updated_at");
    })

    it("should be able to create a withdraw", async () => {

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

        const token = user.body.token;

        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .send({
                amount: 200,
                description: 'rental',
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("user_id");
        expect(response.body).toHaveProperty("description", "rental");
        expect(response.body).toHaveProperty("amount", 200);
        expect(response.body).toHaveProperty("type", "withdraw");
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("updated_at");
    })

    it("should not be able to create a withdraw with insufficient funds", async () => {

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

        const token = user.body.token;

        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .send({
                amount: 500,
                description: 'rental',
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Insufficient funds");
    })
});
