import express, {Request, Response} from 'express';
import path from 'path';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const port = 8000;

const nflTeams = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
    'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
    'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
    'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WSH'
];

const nbaTeams = [
    'ATL', 'BKN', 'BOS', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 
    'DET', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'MIL', 'MIN', 'NO', 'NYK', 'OKC', 'ORL', 'PHI', 'PHX', 
    'POR', 'SAC', 'SAS', 'TOR', 'UTAH', 'WAS'
];

const mlbTeams = [
    'ARI', 'ATL', 'BAL', 'BOS', 'CHC', 'CHW', 'CIN', 'CLE', 
    'COL', 'DET', 'MIA', 'HOU', 'KC', 'LAA', 'LAD', 'MIL', 
    'MIN', 'NYM', 'NYY', 'ATH', 'PHI', 'PIT', 'SD', 'SF', 
    'SEA', 'STL', 'TB', 'TEX', 'TOR', 'WSH'
];

const nhlTeams = [
    'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL',
    'DAL', 'DET', 'EDM', 'FLA', 'LA', 'MIN', 'MTL', 'NJD', 
    'NSH', 'NYI', 'NYR', 'OTT', 'PHI', 'PIT', 'SEA', 'SJ', 
    'STL', 'TB', 'TOR', 'UTA', 'VAN', 'VGK', 'WPG', 'WSH'
];

app.get('/:sport/:league/games/:id', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const game_id = req.params.id;

    const overview = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports` +
        `/${sport}/${league}/scoreboard/${game_id}`)).json();

    const summary = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports` +
        `/${sport}/${league}/summary?event=${game_id}`)).json();

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

    if (req.query.season !== undefined && req.query.week !== undefined){
        const season = req.query.season;
        const week = req.query.week;
        endpoint += `?dates=${season}&week=${week}`;
        console.log(endpoint);
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

    let endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/schedule`;

    if (req.query.season !== undefined && req.query.seasonType !== undefined){
        endpoint += `?season=${req.query.season}&seasonType=${req.query.seasonType}`;
    }

    const response = await fetch(endpoint);
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
    let endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/statistics`;

    if (req.query.season !== undefined){
        endpoint += `?season=${req.query.season}`;
    }

    //const sortIndex = (req.query.sortIndex !== undefined) ? parseInt(`${req.query.sortIndex}`) : 0;

    const response = await fetch(endpoint);

    const data = await response.json();
    res.render('team_stats/overview', {port: port, league: league, data: data});
})

/**
 * This will act as sort of the home page for the selected team. Will feature the logo, any scheduled games, 
 * and the links to the roster, stats or schedule pages
 */
app.get('/:sport/:league/teams/:team', async function(req: Request, res: Response){
    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    //get basic team data
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}`);

    //get news on team
    const response2 = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news?team=${team}`);
    const news = await response2.json();

    const data = await response.json();
    res.render('selected_team', {port: port, sport: sport, league: league, team: team, data: data, news: news});
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

app.get('/:sport/:league/stats', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const leagueStats: any[] = [];

    const teamIDs = (league.toUpperCase() == "NFL") ? nflTeams : (league.toUpperCase() == "NBA") ? nbaTeams :
        (league.toUpperCase() == "MLB") ? mlbTeams : nhlTeams;
    
    //loop through the teams array and make a call on each ID to get that teams data, and render the data
    
    for (const team of teamIDs){
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/` +
            `${sport}/${league}/teams/${team}/statistics`);
        const teamData = await response.json();
        leagueStats.push({teamName: team, categories: teamData.results.stats.categories});
    }
    
    res.render('league_stats', {port: port, sport: sport, league: league, leagueStats: leagueStats});
    
})

app.get('/:sport/:league/player/:playerID', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const playerID = req.params.playerID;

    const endpoint = `https://site.web.api.espn.com/apis/common/v3/sports/${sport}/${league}/athletes/${playerID}`;

    //get the basic info of player like name, position, team, etc
    const basicPlayerInfo = await (await fetch(endpoint)).json();

    //get the basic stats of player, like regular season stats, career, postseason
    const mainPlayerStats = await (await fetch(endpoint + "/overview")).json();

    //get advanced splits of a player
    const advancedPlayerStats = await (await fetch(endpoint + "/splits")).json();

    res.render('player_stats', {port: port, sport: sport, league: league, generalInfo: basicPlayerInfo, 
        playerOverview: mainPlayerStats, playerSplits: advancedPlayerStats});
})

/**
 * For the home page, gets index.ejs
 */
app.get('/', (req: Request, res: Response) => {
    res.render('index', {port: port});
}) 

app.listen(port, () => {
    console.log("Started!");
});