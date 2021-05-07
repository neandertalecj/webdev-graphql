const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('../schema/schema')
const mongoose = require('mongoose')
const cors = require('cors');
const { PASWORD, USER, DB } = require('../../config');

const app = express();
const PORT = 3005;

mongoose.connect(`mongodb+srv://${USER}:${PASWORD}@cluster0.2hut9.mongodb.net/${DB}?retryWrites=true&w=majority`,  {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(cors())//(1)

app.use('/graphql', graphqlHTTP({//(2) - інакше корс не поможе цьому запросу
  schema,
  graphiql: true, //додало UI для роботи із запросами
}));

// Перевірка чи виконано зєднання
const dbConnection = mongoose.connection;
dbConnection.on('error', err => console.log(`Connection error: ${err}`));
dbConnection.once('open', () => console.log('Connected to DB!'));

app.listen(PORT, err => {
  err ? console.log(err) : console.log('Server started!')
})