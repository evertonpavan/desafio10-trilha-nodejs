import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const id = uuidV4();
        const passsword = await hash('portugal', 8);

        await connection.query(
            `INSERT INTO users (id, name, email, password, created_at, updated_at)
            VALUES ('${id}', 'Cristiano Ronaldo', 'ronald@cr7.com', '${passsword}', now(), now())`
        );
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to get a balance", async () => {

        const authResponse = await request(app)
            .post("/api/v1/sessions")
            .send({
                email: "ronald@cr7.com",
                password: "portugal"
            })

        const { token } = authResponse.body;

        const response = await request(app)
            .get("/api/v1/statements/balance")
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.body).toHaveProperty("balance");
        expect(response.body).toHaveProperty("statement");
    })

    it("should not be able to get a balance a nonexistent user", async () => {

        const authResponse = await request(app)
            .post("/api/v1/sessions")
            .send({
                email: "ronald@cr7.com",
                password: "portugal"
            })

        const { token, user } = authResponse.body;

        await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

        const response = await request(app)
            .get("/api/v1/statements/balance")
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(404);

    })
});
