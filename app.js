const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log('DB Error: ${e.message}')
  }
}
initializeDatabaseAndServer()

//convert dbObject into responseObject

const convertdbObjectintoreponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id, //dbObject.movie_id → takes the value from the database object and renaming it to movieId
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}
const convertdbObjectintoreponseObject2 = dbObject => {
  return {
    //dbObject.movie_id → takes the value from the database object and renaming it to movieId
    directorId: dbObject.director_id,

    directorName: dbObject.director_name,
  }
}
//api1

app.get('/movies/', async (request, response) => {
  const moviesListQuery = `
  SELECT * FROM movie;`
  const dbResponseArray = await db.all(moviesListQuery)
  response.send(
    dbResponseArray.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})

//api2

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES (${directorId},
  '${movieName}',
  '${leadActor}'
  );`
  const dbResponse = db.run(addMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

//api3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params //params is an object so we use object destructuring
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`
  const dbResponse = await db.get(getMovieQuery)
  response.send(convertdbObjectintoreponseObject(dbResponse))
})

//api4

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updatedMovieQuery = `
  UPDATE movie
  SET director_id = ${directorId} ,movie_name='${movieName}',lead_actor ='${leadActor}'
  WHERE movie_id=${movieId}
  `
  const dbResponse = await db.run(updatedMovieQuery)
  response.send('Movie Details Updated')
})

//api5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId};`
  const dbResponse = await db.run(deleteQuery)
  response.send('Movie Removed')
})

//api6

app.get('/directors/', async (request, response) => {
  const directorsList = `
  SELECT * FROM director;`
  const dbResponse = await db.all(directorsList)
  response.send(
    dbResponse.map(eachdirector =>
      convertdbObjectintoreponseObject2(eachdirector),
    ),
  )
})

//api7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const Query = `SELECT * FROM movie WHERE director_id=${directorId};`
  const dbResponse = await db.all(Query)
  response.send(
    dbResponse.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})
module.exports = app
