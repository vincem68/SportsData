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


const gamesRouter = require('./routes/games');
const teamsRouter = require('./routes/teams');

app.use('/:sport/:league/teams', teamsRouter);
app.use('/:sport/:league/games', gamesRouter);

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


/**
 * This will be the route that gives us the standings for the requested league
 */
app.get('/:sport/:league/standings', async function(req: Request, res: Response){
    const sport = req.params.sport;
    const league = req.params.league;

    //array to store the team data
    const teamStandings: any[] = [];

    const teamIDs = (league.toUpperCase() == "NFL") ? nflTeams : (league.toUpperCase() == "NBA") ? nbaTeams :
        (league.toUpperCase() == "MLB") ? mlbTeams : nhlTeams;

    //start sending requests for data
    for (const team of teamIDs){
        const teamData = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}`)).json();
        if (teamData.team.record.items === undefined){
            break;
        } else {
            teamStandings.push(teamData);
        }
    }

    res.render('league_standings', {port: port, sport: sport, league: league, teamStandings: teamStandings});
})

app.get('/:sport/:league/leaders', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    let leadersEndpoint = `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/`;
    `2025/types/3/leaders`;

    const yearAndTypeResponse = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`)).json();
    const currentYear = yearAndTypeResponse.season.year;
    const seasonType = yearAndTypeResponse.season.type;

    if (req.query.season !== undefined && req.query.seasonType !== undefined){
        const season = req.query.season;
        const type = req.query.seasonType;
        leadersEndpoint += `${season}/types/${type}/leaders`;
    } else if (seasonType != 2 && seasonType != 3){
        leadersEndpoint += `${currentYear - 1}/types/2/leaders`;
    } else {
        leadersEndpoint += `${currentYear}/types/${seasonType}/leaders`;
    }
    
    //send the leaders request
    const data = await (await fetch(leadersEndpoint)).json();
    res.render('league_leaders', {port: port, sport: sport, league: league, data: data, currentYear: currentYear});
})

/**
 * This route will be for getting the stats of a specific player
 */
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