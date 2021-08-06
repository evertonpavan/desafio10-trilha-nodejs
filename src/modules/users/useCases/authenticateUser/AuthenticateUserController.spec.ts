import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to authenticate", async () => {

        await request(app)
            .post("/api/v1/users")
            .send({
                name: "Lionel Messi",
                email: "messi@messi.com",
                password: "thebest"
            })

        const response = await request(app)
            .post("/api/v1/sessions")
            .send({
                email: "messi@messi.com",
                password: "thebest"
            })

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");

    })

    it("should not be able to authenticate with nonexistent user", async () => {

        const response = await request(app)
            .post("/api/v1/sessions")
            .send({
                email: "neymar@jr.com",
                password: "999999"
            })

        expect(response.status).toBe(401);
    });

    it("should not be able to authenticate with incorrect password", async () => {

        const response = await request(app)
            .post("/api/v1/sessions")
            .send({
                email: "messi@messi.com",
                password: "argentina"
            })

        expect(response.status).toBe(401);
    })
});
