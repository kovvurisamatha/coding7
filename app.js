const express = require('express')
const path = require('path')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const initializeAndStartDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`dberror:${e.message}`)
    process.exit(1)
  }
}
initializeAndStartDb()

module.exports = app
//api1
const getplayerdetails = dbobject => {
  return {
    playerId: dbobject.player_id,
    playerName: dbobject.player_name,
  }
}
app.get('/players/', async (request, response) => {
  const playerquery = `select * from player_details`
  const dbresponse = await db.all(playerquery)
  response.send(
    dbresponse.map(eachplayer => {
      getplayerdetails(eachplayer)
    }),
  )
})
//api2
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const addplayerquery = `select * from player_details
  where player_id=${playerId}`
  const dbresponse = await db.get(addplayerquery)
  response.send(getplayerdetails(dbresponse))
})
//api3
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const player_details = request.body
  const {playerName} = player_details
  const updatequery = `update player_details 
  set player_name='${playerName}'
  where player_id=${playerId}`
  await db.run(updatequery)
  response.send('Player Details Updated')
})
//api4
const gettingmatchdetails = dbobject => {
  return {
    matchId: dbobject.match_id,
    match: dbobject.match,
    year: dbobject.year,
  }
}
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const matchquery = `select * from match_details
  where match_id=${matchId}`
  const matchdbresponse = await db.get(matchquery)
  response.send(gettingmatchdetails(matchdbresponse))
})
//api5
const gettingmatchdetail = dbobject => {
  return {
    matchId: dbobject.match_id,
    match: dbobject.match,
    year: dbobject.year,
  }
}
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const matchesquery = `select * from match_details 
  natural join player_match_score where player_id=${playerId}`
  const dbresponse = await db.all(matchesquery)
  response.send(
    dbresponse.map(eachmatch => {
      gettingmatchdetail(eachmatch)
    }),
  )
})
//api6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const playersquery = `select player_details.player_id as playerId,
  player_details.player_name as playerName from player_match_score natural join player_details
  where match_id=${matchId} `
  playerslist = await db.all(playersquery)
  response.send(playerslist)
})
//api7
app.get('/players/:playerId/playerscores', async (request, response) => {
  const {playerId} = request.params
  const getplayerscore = `select 
  player_details.player_id as playerId,
  player_details.player_name as playerName,
  sum(player_match_score.score) as totalScore,
  sum(fours) as totalFours,
  sum(sixes) as totalSixes from player_details inner join 
  player_match_score on
  player_details.player_id=player_match_score.player_id where
  player_details.player_id=${playerId}`
  const statistics = await db.get(getplayerscore)
  response.send(statistics)
})
