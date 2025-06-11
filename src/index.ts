import express, {Request, Response} from 'express';
import path from 'path';
import Abbreviation from './classes/Abbreviation';

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
app.get('/:sport/:league/games', async function(req: Request, res: Response) {

    const sport = req.params.sport;
    const league = req.params.league;
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`);
    const data = await response.json();
    res.render('scheduled_games', { sport: sport, league: league, data: data });
})

/**
 * Used when the user has selected a specific team
 */
app.get('/:sport/:league/teams/:team/roster', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/' + 
        `${sport}/${league}/teams/${team}/roster`);
    
    const data = await response.json();
    res.render('team_roster', {league: league, sport: sport, team: team, data: data});
})

/**
 * This route will get the schedule for the specified team
 */
app.get('/:sport/:league/teams/:team/schedule', async function(req: Request, res: Response){
    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
        `/teams/${team}/schedule`);

    const data = await response.json();
    res.render('team_schedule', {team: team, data: data});
})

/**
 * This will be for stats
 */
app.get('/:sport/:league/teams/:team/stats', async function(req: Request, res: Response){
    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
        `/teams/${team}/statistics`);

    const data = await response.json();
    res.render('team_stats', {data: data});
})

/**
 * This will act as sort of the home page for the selected team. Will feature the logo, any scheduled games, 
 * and the links to the roster, stats or schedule pages
 */
app.get('/:sport/:league/teams/:team', async function(req: Request, res: Response){
    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
        `/teams/${team}`);

    const data = await response.json();
    res.render('selected_team', {sport: sport, league: league, team: team, data: data});
})

/**
 * This will be for sending the user to the teams page. Get JSON data of all teams in a league and 
 * display them all
 */
app.get('/:sport/:league/teams', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const response = await fetch(`http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
    const data = await response.json();
    res.render('team_selection', {sport: sport, league: league, teams: data.sports[0].leagues[0].teams});
})

/*
app.get(':sport/:league/stats', async function(req: Request, res: Response){
    
    const sport = req.params.sport;
    const league = req.params.league;

    const team_names: string[] = [];
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
    const name_list = await response.json();
    name_list.sports[0].leagues[0].teams.forEach(team => {
        team_names.push(team.team.abbreviation);
    })


    const team_stats: any[] = [];
})
*/

/**
 * For the home page, gets index.ejs
 */
app.get('/', (req: Request, res: Response) => {
    res.render('index');
}) 

app.listen(port, () => {
    console.log("Started!");
});