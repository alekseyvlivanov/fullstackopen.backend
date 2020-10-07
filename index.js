require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("build"));

app.use(
  morgan((tokens, req, res) => {
    const data = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ];
    if (data[0] === "POST") {
      data.push(JSON.stringify(req.body));
    }
    return data.join(" ");
  })
);

const generateId = () => {
  return Math.round(Math.random() * 10000);
};

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.status(404).end();
    });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const { body } = req;

  if (!body.name) {
    return res.status(409).json({
      error: "name is missing",
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return res.status(409).json({
      error: "name must be unique",
    });
  }

  if (!body.number) {
    return res.status(409).json({
      error: "number is missing",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  res.json(person);
});

app.get("/info", (req, res) => {
  Person.find({}, "id")
    .then((result) => {
      const data = `
      <p>Phonebook has info for ${result.length} people</p>
      <p>${new Date()}</p>
      `;
      res.send(data);
    })
    .catch((err) => {
      res.status(404).end();
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
