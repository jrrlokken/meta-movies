const express = require('express');
const cors = require('cors');
const knex = require('knex');
const axios = require('axios');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  },
});


const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// GET: fetch all movies from database
app.get('/', (req,res) => {
  db.select('*')
    .from('movies')
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

// GET: fetch movie by id
app.get('/:movieId', (req,res) => {
  const movieId = req.params.movieId;
  db.select('*')
    .from('movies')
    .where('movie_id', '=', movieId)
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

// POST: add movie to the database
app.post('/add-movie', (req,res) => {
  const { movieName, imgUrl, releaseYear, summary, director, genre, rating, movieRuntime, metaScore } = req.body;
  db('movies')
    .insert({
      movie_name: movieName,
      img_url: imgUrl,
      release_year: releaseYear,
      summary: summary,
      director: director,
      genre: genre,
      rating: rating,
      movie_runtime: movieRuntime,
      meta_score: metaScore,
    })
    .then(() => {
      console.log("Movie added");
      // return res.json({ msg: 'Movie Added' });
      return res.redirect('http://localhost:3000');
    })
    .catch((error) => {
      console.log(error);
    })
})

// DELETE: delete movie from database by id
app.delete('/delete-movie', (req,res) => {
  const movieId = req.body;
  const movieIdToDelete = Number(movieId.movieId);
  console.log(movieIdToDelete);
  db('movies')
    .where('movie_id', '=', movieIdToDelete)
    .del()
    .then(() => {
      console.log("Movie deleted");
      return res.json({ msg: 'Movie Deleted' });
    })
    .catch((error) => {
      console.log(error);
    });
});

// PUT: Update movie by id
app.put('/update-movie', (req,res) => {
  db('movies')
    .where('movie_id', '=', 1)
    .update({ movie_name: 'Goldeneye' })
    .then(() => {
      console.log("Movie updated");
      return res.json({ msg: 'Movie Updated' });
    })
    .catch((error) => {
      console.log(error);
    });
});

// HarperDB routes
// GET: fetch all movies from the database
app.get("/online/harperdb", (req,res) => {
  const data = { operation: 'sql', sql: 'SELECT * FROM dev.movies'};

  const config = {
    method: 'POST',
    url: process.env.HARPERDB_URL,
    headers: {
      Authorization: `Basic ${process.env.HARPERDB_AUTH}`,
      'Content-Type': 'application/json',
    },
    data: data,
  };

  axios(config)
    .then((response) => {
      const data = response.data;
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

// GET: Fetch movie by movieId from the database
app.get('/online/harperdb/:movieId', (req, res) => {
  const movieId = req.params.movieId;
  console.log(movieId);

  const data = { operation: 'sql', sql: `SELECT * FROM dev.movies WHERE movie_id = ${movieId}` };

  const config = {
      method: 'post',
      url: process.env.HARPERDB_URL,
      headers: {
          Authorization: `Basic ${process.env.HARPERDB_AUTH}`,
          'Content-Type': 'application/json',
      },
      data: data,
  };

  axios(config)
      .then((response) => {
          const data = response.data;
          console.log(data);
          res.json(data);
      })
      .catch((error) => {
          console.log(error);
      });
});

// POST: Create movies and add them to the database
app.post('/online/harperdb/add-movie', (req, res) => {
  const { movieName, imgUrl, releaseYear, summary, director, genre, rating, movieRuntime, metaScore } = req.body;
  console.log(req.body);

  const data = {
      operation: 'insert',
      schema: 'dev',
      table: 'movies',
      records: [
          {
              movie_name: movieName,
              img_url: imgUrl,
              release_year: releaseYear,
              summary: summary,
              director: director,
              genre: genre,
              rating: rating,
              movie_runtime: movieRuntime,
              meta_score: metaScore,
          },
      ],
  };

  const config = {
      method: 'post',
      url: process.env.HARPERDB_URL,
      headers: {
          Authorization: `Basic ${process.env.HARPERDB_AUTH}`,
          'Content-Type': 'application/json',
      },
      data: data,
  };

  axios(config)
      .then((response) => {
          const data = response.data;
          console.log(data);
          res.json(data);
      })
      .catch((error) => {
          console.log(error);
      });
});

// DELETE: Delete movie by movieId from the database
app.delete('/online/harperdb/delete-movie', (req, res) => {
  const movieId = req.body.movieId;
  console.log(movieId);

  const data = { operation: 'sql', sql: `DELETE FROM dev.movies WHERE movie_id = ${movieId}` };

  const config = {
      method: 'post',
      url: process.env.HARPERDB_URL,
      headers: {
          Authorization: `Basic ${process.env.HARPERDB_AUTH}`,
          'Content-Type': 'application/json',
      },
      data: data,
  };

  axios(config)
      .then((response) => {
          res.send({ msg: 'Movie Deleted' });
          console.log('Movie Deleted');
      })
      .catch((error) => {
          console.log(error);
      });
});

// PUT: Update movie by movieId from the database
app.put('/online/harperdb/update-movie', (req, res) => {
  const movieId = req.body.movieId;
  console.log(movieId);

  const data = { operation: 'sql', sql: `UPDATE dev.movies SET movie_name = 'Goldeneye' WHERE movie_id = ${movieId}` };

  const config = {
      method: 'post',
      url: process.env.HARPERDB_URL,
      headers: {
          Authorization: `Basic ${process.env.HARPERDB_AUTH}`,
          'Content-Type': 'application/json',
      },
      data: data,
  };

  axios(config)
      .then((response) => {
          res.send({ msg: 'Movie Updated' });
          console.log('Movie Updated');
      })
      .catch((error) => {
          console.log(error);
      });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));