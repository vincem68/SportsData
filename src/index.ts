import express, {Request, Response} from 'express';
import path from 'path';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const port = 8000; //the port we will listen on, change this for whatever port you will use

/**
 * These arrays contain every team abbreviation for the 4 major sports leagues. We use these when sending 
 * requests to the ESPN enpoints
 */
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

/**
 * This route will be for getting specific game data. Using the game's ID, we can get both the general overview
 * of the game which includes the team logos, scores, game time/status and records, and also get the overall
 * stats for the game's boxscore.
 */
app.get('/:sport/:league/games/:id', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const game_id = req.params.id;

    const overviewEndpoint = `https://site.api.espn.com/apis/site/v2/sports` +
        `/${sport}/${league}/scoreboard/${game_id}`;

    const summaryEndpoint = `https://site.api.espn.com/apis/site/v2/sports` +
        `/${sport}/${league}/summary?event=${game_id}`;

    const overview = await (await fetch(overviewEndpoint)).json();

    const summary = await (await fetch(summaryEndpoint)).json();

    //maybe we need to see what kinds of data is available in the pre state
    //overview will be used for selected_game, boxscore will be used for the more specific subfile
    res.render('selected_game', {port: port, league: league, overview: overview, summary: summary, 
        overviewEndpoint: overviewEndpoint, summaryEndpoint: summaryEndpoint});
})

/**
 * This route will be for displaying any upcomig games for the day by default. Can also go back and display 
 * games at whatever date you want to put in.
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

    if (req.query.season !== undefined && req.query.week !== undefined && req.query.seasonType !== undefined){
        const season = req.query.season;
        const week = req.query.week;
        const type = req.query.seasonType;
        endpoint += `?dates=${season}&week=${week}&seasontype=${type}`;
    }

    const data = await (await fetch(endpoint)).json();
    res.render('scheduled_games', { port: port, sport: sport, league: league, data: data, endpoint: endpoint});
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
        endpoint += `?season=${req.query.season}&seasontype=${req.query.seasonType}`;
    }

    const response = await fetch(endpoint);
    const data = await response.json();

    const requestedSeason = (req.query.season !== undefined) ? req.query.season : 0;
    const requestedType = (req.query.seasonType !== undefined) ? req.query.seasonType : "0";

    res.render('team_schedules/team_schedule', {port: port, team: team, league: league, sport: sport, 
        requestedSeason: requestedSeason, requestedType: requestedType, data: data});
})

/**
 * This route will be for the stats of a team.
 */
app.get('/:sport/:league/teams/:team/stats', async function(req: Request, res: Response){
    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;
    let endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/statistics`;
    const requestedType = (req.query.seasonType !== undefined) ? req.query.seasonType : 2;

    if (req.query.season !== undefined && req.query.seasonType !== undefined){
        endpoint += `?season=${req.query.season}&seasontype=${req.query.seasonType}`;
    }

    //check to get team name and season if requested endpoint has code 404, get required data
    const checkData = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/` +
        `${league}/teams/${team}/statistics`)).json();
    const year = (checkData.season.type != 1) ? checkData.season.year : checkData.season.year - 1;
    const teamName = checkData.team.displayName;
    const logo = checkData.team.logo;

    const data = await (await fetch(endpoint)).json();

    res.render('team_stats/overview', {port: port, league: league, year: year, teamName: teamName, logo: logo, 
        requestedType: requestedType, data: data});
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

/**
 * this route is for gathering the overall stats from the entire league. By default, grabs the current stats
 * of the regular season. We use the team abbreviations arrays above to make requests to the endpoint for 
 * each team's stats and send it all to the page. 
 */
app.get('/:sport/:league/stats', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const leagueStats: any[] = [];
    const queries = (req.query.season !== undefined && req.query.seasonType !== undefined) ? 
        `?season=${req.query.season}&seasontype=${req.query.seasonType}` : "";
    
    let requestedSeason = 0;
    let currentType = 0;
    
    //set the team array to whichever league we're using
    const teamIDs = (league.toUpperCase() == "NFL") ? nflTeams : (league.toUpperCase() == "NBA") ? nbaTeams :
        (league.toUpperCase() == "MLB") ? mlbTeams : nhlTeams;

    //get the current season of the league
    const currentYearResponse = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
        `/teams/${teamIDs[0]}/statistics?season=2024`)).json();

    let currentSeason = currentYearResponse.season.year;

    //test request to see if available data
    const checkValidResponse = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
        `/teams/${teamIDs[0]}/statistics${queries}`)).json();

    //check if code 404 exists
    if (checkValidResponse.code === undefined) {
        //loop through the teams array and make a call on each ID to get that teams data, and render the data
        for (const team of teamIDs){

            let endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
            `/teams/${team}/statistics${queries}`;

            const teamData = await (await fetch(endpoint)).json();

            if (requestedSeason == 0){
                requestedSeason = teamData.requestedSeason.year;
                currentType = teamData.season.type;
                currentSeason = teamData.season.year;
            }

            if (req.query.seasonType == "3"){
                if (teamData.requestedSeason.qualifiedPostSeason){
                    leagueStats.push({teamName: team, categories: teamData.results.stats.categories});
                }
            } else {
                leagueStats.push({teamName: team, categories: teamData.results.stats.categories});
            }
        }
    }
    
    res.render('league_stats', {port: port, sport: sport, league: league, requestedSeason: requestedSeason, 
        currentSeason: currentSeason, currentType: currentType, leagueStats: leagueStats});
    
})

app.get('/:sport/:league/leaders', async function(req: Request, res: Response){
    const sport = req.params.sport;
    const league = req.params.league;
    let endpoint = `https://site.api.espn.com/apis/site/v3/sports/${sport}/${league}/leaders`;
    if (req.query.season !== undefined && req.query.seasonType !== undefined){
        endpoint += `?season=${req.query.season}&seasontype=${req.query.seasonType}`;
    }

    const data = await (await fetch(endpoint)).json();
    res.render('league_leaders', {port: port, sport: sport, league: league, data: data});
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