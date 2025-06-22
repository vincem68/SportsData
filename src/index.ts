import express, {Request, Response} from 'express';
import path from 'path';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const port = 8000;

app.get('/:sport/:league/games/:id', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const game_id = req.params.id;

    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard/${game_id}`);
    const overview = await response.json();

    const response2 = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${game_id}`);
    const summary = await response2.json();

    //maybe we need to see what kinds of data is available in the pre state
    //overview will be used for selected_game, boxscore will be used for the more specific subfile
    res.render('selected_game', {port: port, league: league, overview: overview, boxscore: summary.boxscore});
})

/**
 * For the games page, will get the league and sport names and get the games in each league
 */
app.get('/:sport/:league/games', async function(req: Request, res: Response) {

    const sport = req.params.sport;
    const league = req.params.league;
    let endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;

    //gotta take out the hyphons I think
    if (req.query.date !== undefined){
        const date = req.query.date.toString();
        endpoint += `?dates=${date.replace(/-/g, "")}`;
    }

    const response = await fetch(endpoint);
    const data = await response.json();
    res.render('scheduled_games', { port: port, sport: sport, league: league, data: data });
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
    res.render('team_roster', {port: port, league: league, sport: sport, team: team, data: data});
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
    res.render('team_schedule', {port: port, team: team, data: data});
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

    const game = await response.json();
    res.render('team_stats', {port: port, game: game});
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
    res.render('selected_team', {port: port, sport: sport, league: league, team: team, data: data});
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
    res.render('team_selection', {port: port, sport: sport, league: league, teams: data.sports[0].leagues[0].teams});
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
    res.render('index', {port: port});
}) 

app.listen(port, () => {
    console.log("Started!");
});