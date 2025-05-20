import express, {Request, Response} from 'express';
import path from 'path';

import { MLB_Data } from './classes/league_game_data/MLB_Data';
import { NBA_Data } from './classes/league_game_data/NBA_Data';
import { NFL_Data } from './classes/league_game_data/NFL_Data';
import { NHL_Data } from './classes/league_game_data/NHL_Data';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const port = 8000;

/**
 * For the games page, will get the league and sport names and get the games in each league
 */
app.get('/games', async function(req: Request, res: Response) {

    const sport = req.query.sport;
    const league = req.query.league;
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`);
    const scores = await response.json();
    res.render('games', { sport, league, scores: scores });
})

/**
 * This will be for sending the user to the teams page. Get JSON data of all teams in a league and 
 * display them all
 */
app.get('/teams', async function(req: Request, res: Response){

    const sport = req.query.sport;
    const league = req.query.league;
    const response = await fetch(`http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
    const data = await response.json();
    res.render('team_selection', {sport: sport, league: league, teams: data.sports[0].leagues[0].teams});
})


/**
 * For the home page, gets index.ejs
 */
app.get('/', (req: Request, res: Response) => {
    res.render('index', { port: port });
}) 

app.listen(port, () => {
    console.log("Started!");
});

