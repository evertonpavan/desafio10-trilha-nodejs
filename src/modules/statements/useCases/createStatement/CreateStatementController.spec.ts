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

        // expect(response.body).toHaveProperty("amount");
        console.log(response.body)
    })




});
