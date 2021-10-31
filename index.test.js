// This tests the express API with "testuser". All endpoints are tested

const request = require("supertest")
const app = require("./index.js")

// We need a tear down to make sure the postgres state is in order
beforeAll(async () => {
    await request(app).delete("/account").query({
        username: "test"
    });
  });

// We need a tear up to make sure the postgres state is in order
afterAll(async () => {
    await request(app).delete("/account").query({
        username: "test"
    });
  });

// POST REQUESTS FOR APP API
describe("POST Requests App API", () => {

    // /ACCOUNT
    describe("POST /account success", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).post("/account").query({
                username: "test"
            });
            expect(response.body.username).toBe("test");
            expect(response.statusCode).toBe(200);
        })
    })
  
    describe("POST /account failure", () => {
        test("should respond with a 400 status code", async () => {
            const response = await request(app).post("/account").send();
            expect(response.error.text).toBe('Username is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
    })

    // /DEPOSIT
    describe("POST /deposit success", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).post("/deposit").query({
                username: "test",
                amount: 10000,
            });
            expect(response.body).toEqual({
                "username": "test",
                "amount": "10000",
                "account_value": 10000
            })
            expect(response.statusCode).toBe(200);
        })
    })
  
    describe("POST /deposit failure", () => {
        test("should respond with a 400 status code (did not include username)", async () => {
            const response = await request(app).post("/deposit").query({
                amount: 1,
            });
            expect(response.error.text).toBe('Username is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (did not include amount)", async () => {
            const response = await request(app).post("/deposit").query({
                username: "test"
            });
            expect(response.error.text).toBe('Amount is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (0 account amount)", async () => {
            const response = await request(app).post("/deposit").query({
                username: "test",
                amount: 0,
            });
            expect(response.error.text).toBe('Amount must be positive')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (negative account amount)", async () => {
            const response = await request(app).post("/deposit").query({
                username: "test",
                amount: -1,
            });
            expect(response.error.text).toBe('Amount must be positive')
            expect(response.statusCode).toBe(400);
        })
    })

    // /WITHDRAWAL
    describe("POST /withdrawal success", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).post("/withdrawal").query({
                username: "test",
                amount: 1,
            });
            expect(response.body).toEqual({
                "username": "test",
                "amount": "1",
                "account_value": 9999
            })
            expect(response.statusCode).toBe(200);
        })
    })
  
    describe("POST /withdrawal failure", () => {
        test("should respond with a 400 status code (did not include username)", async () => {
            const response = await request(app).post("/withdrawal").query({
                amount: 1,
            });
            expect(response.error.text).toBe('Username is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (did not include amount)", async () => {
            const response = await request(app).post("/withdrawal").query({
                username: "test"
            });
            expect(response.error.text).toBe('Amount is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (0 account amount)", async () => {
            const response = await request(app).post("/withdrawal").query({
                username: "test",
                amount: 0,
            });
            expect(response.error.text).toBe('Amount must be positive')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (negative account amount)", async () => {
            const response = await request(app).post("/withdrawal").query({
                username: "test",
                amount: -1,
            });
            expect(response.error.text).toBe('Amount must be positive')
            expect(response.statusCode).toBe(400);
        })
    })

    // /PURCHASE
    describe("POST /purchase success", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).post("/purchase").query({
                username: "test",
                amount: 1,
                ticker: "aapl",
            });
            expect(response.body).toMatchObject({
                "amount": "1",
                "ticker": "aapl",
                "username": "test",
            })
            expect(response.statusCode).toBe(200);
        })
    })

    describe("POST /purchase failure", () => {
        test("should respond with a 400 status code (did not include username)", async () => {
            const response = await request(app).post("/purchase").query({
                amount: 1,
                ticker: "aapl",
            });
            expect(response.error.text).toBe('Username is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (did not include amount)", async () => {
            const response = await request(app).post("/purchase").query({
                username: "test",
                ticker: "aapl",
            });
            expect(response.error.text).toBe('Amount is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (did not include ticker)", async () => {
            const response = await request(app).post("/purchase").query({
                username: "test",
                amount: 1,
            });
            expect(response.error.text).toBe('Ticker is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (invalid ticker)", async () => {
            const response = await request(app).post("/purchase").query({
                username: "test",
                amount: 1,
                ticker: "faketicker"
            });
            expect(response.error.text).toBe('Cannot get current price for stock. Unable to make purchase')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (negative account amount)", async () => {
            const response = await request(app).post("/purchase").query({
                username: "test",
                ticker: "aapl",
                amount: -1,
            });
            expect(response.error.text).toBe('Amount must be positive')
            expect(response.statusCode).toBe(400);
        })
    })

    // /SALE
    describe("POST /sale success", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).post("/sale").query({
                username: "test",
                amount: 1,
                ticker: "aapl",
            });
            expect(response.body).toMatchObject({
                "amount": "1",
                "ticker": "aapl",
                "username": "test",
            })
            expect(response.statusCode).toBe(200);
        })
    })

    describe("POST /sale failure", () => {
        test("should respond with a 400 status code (selling more than owned)", async () => {
            const response = await request(app).post("/sale").query({
                amount: 1,
                username: "test",
                ticker: "aapl",
            });
            expect(response.error.text).toBe('Cannot sell more stock than you currently own.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (did not include username)", async () => {
            const response = await request(app).post("/sale").query({
                amount: 1,
                ticker: "aapl",
            });
            expect(response.error.text).toBe('Username is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (did not include amount)", async () => {
            const response = await request(app).post("/sale").query({
                username: "test",
                ticker: "aapl",
            });
            expect(response.error.text).toBe('Amount is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (did not include ticker)", async () => {
            const response = await request(app).post("/sale").query({
                username: "test",
                amount: 1,
            });
            expect(response.error.text).toBe('Ticker is not defined in request body.')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (invalid ticker)", async () => {
            const response = await request(app).post("/sale").query({
                username: "test",
                amount: 1,
                ticker: "faketicker"
            });
            expect(response.error.text).toBe('Cannot get current price for stock. Unable to make sale')
            expect(response.statusCode).toBe(400);
        })
        test("should respond with a 400 status code (negative account amount)", async () => {
            const response = await request(app).post("/sale").query({
                username: "test",
                ticker: "aapl",
                amount: -1,
            });
            expect(response.error.text).toBe('Amount must be positive')
            expect(response.statusCode).toBe(400);
        })
    })
})

// GET REQUESTS FOR APP API
describe("GET Requests App API", () => {

    // /QUERY
    describe("GET /query success", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).get("/account?username=test").send();
            expect(response.statusCode).toBe(200);
        })
    })
  
    describe("GET /query failure", () => {
        test("should respond with a 400 status code", async () => {
            const response = await request(app).get("/account").send();
            expect(response.statusCode).toBe(400);
        })
    })

    // /account/details
    describe("GET /account/details success", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).get("/account/details?username=test").send();
            expect(response.statusCode).toBe(200);
        })
    })
  
    describe("GET /account/details failure", () => {
        test("should respond with a 400 status code", async () => {
            const response = await request(app).get("/account/details").send();
            expect(response.statusCode).toBe(400);
        })
    })
})

// GET REQUESTS FOR MARKET API
describe("GET Requests Market", () => {

  describe("GET /query success", () => {
    test("should respond with a 200 status code", async () => {
        const response = await request(app).get("/query?query=AAPL").send();
        expect(response.statusCode).toBe(200);
    })
  })

  // We don't have a failure clause because the api returns 200 status no matter what
  describe("GET /ticker/info success", () => {
    test("should respond with a 200 status code and correct ticker", async () => {
        const response = await request(app).get("/ticker/info?ticker=AAPL").send();
        expect(response.body.symbol).toBe("AAPL");
        expect(response.statusCode).toBe(200);
    })
  })
})