require('dotenv').config();

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const Person = require('./models/person');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.use(
  morgan((tokens, req, res) => {
    const data = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ];
    if (data[0] === 'POST') {
      data.push(JSON.stringify(req.body));
    }
    return data.join(' ');
  }),
);

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => res.json(persons))
    .catch((err) => next(err));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch((err) => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, {
    context: 'query',
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((err) => next(err));
});

app.post('/api/persons', (req, res, next) => {
  const { body } = req;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((savedAndFormattedPerson) => res.json(savedAndFormattedPerson))
    .catch((err) => next(err));
});

app.get('/info', (req, res, next) => {
  Person.find({}, 'id')
    .then((persons) => {
      const data = `
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
      `;
      res.send(data);
    })
    .catch((err) => next(err));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  return next(err);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
