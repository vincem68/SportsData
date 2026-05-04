import express, {Request, Response} from 'express';
import path from 'path';

import { checkRequestParams, checkValidSeason, getBasicResponseInfo, checkQueryParams } from './validation_functions';

import teamRoutes from './routes/teams';
import gameRoutes from './routes/games';

//interfaces
import type { LeagueStats } from './interfaces/types/LeagueStats.types';
import type {LeagueStatsResponse} from './interfaces/types/LeagueStats.types';
import type { LeagueStandings } from './interfaces/types/Standings.types';
import type { BasicPlayerStatsResponse, BasicPlayerStats, PlayerSplits, 
    PlayerSplitsResponse, PlayerStatsOverview, PlayerStatsOverviewResponse
} from './interfaces/types/PlayerStats.types';

//parsers
import { parseLeageStatsResponse } from './interfaces/transformations/LeagueStats';
import { parseBasicPlayerStats, parseMainPlayerStats, parsePlayerSplits } from './interfaces/transformations/PlayerStats';
import { parseLeaderData } from './interfaces/transformations/Leaders';
import { parseStandingsResponse } from './interfaces/transformations/Standings';


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'public', 'views'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

const port: number = 8000; //the port we will listen on, change this for whatever port you will use

/**
 * These arrays contain every team abbreviation for the 4 major sports leagues. We use these when sending 
 * requests to the ESPN enpoints
 */
export const nflTeams = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
    'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
    'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
    'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WSH'
];

export const nbaTeams = [
    'ATL', 'BKN', 'BOS', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 
    'DET', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'MIL', 'MIN', 'NO', 'NY', 'OKC', 'ORL', 'PHI', 'PHX', 
    'POR', 'SAC', 'SAS', 'TOR', 'UTAH', 'WAS'
];

export const mlbTeams = [
    'ARI', 'ATL', 'BAL', 'BOS', 'CHC', 'CHW', 'CIN', 'CLE', 
    'COL', 'DET', 'MIA', 'HOU', 'KC', 'LAA', 'LAD', 'MIL', 
    'MIN', 'NYM', 'NYY', 'ATH', 'PHI', 'PIT', 'SD', 'SF', 
    'SEA', 'STL', 'TB', 'TEX', 'TOR', 'WSH'
];

export const nhlTeams = [
    'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL',
    'DAL', 'DET', 'EDM', 'FLA', 'LA', 'MIN', 'MTL', 'NJ', 
    'NSH', 'NYI', 'NYR', 'OTT', 'PHI', 'PIT', 'SEA', 'SJ', 
    'STL', 'TB', 'TOR', 'UTA', 'VAN', 'VGK', 'WPG', 'WSH'
];


app.use('/:sport/:league/teams', teamRoutes);
app.use('/:sport/:league/games', gameRoutes);

/**
 * this route is for gathering the overall stats from the entire league. By default, grabs the current stats
 * of the regular season. We use the team abbreviations arrays above to make requests to the endpoint for 
 * each team's stats and send it all to the page. 
 */
app.get('/:sport/:league/stats', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;

    //check request params
    if (!checkRequestParams(sport, league)){
        res.status(400).send("Invalid sport or league");
        return;
    }

    //get the list of teams to send to the parser
    const teams = (league.toUpperCase() == "NFL") ? nflTeams : (league.toUpperCase() == "NBA") ? nbaTeams :
        (league.toUpperCase() == "MLB") ? mlbTeams : nhlTeams;

    //get the data from the parser. Add in the queries if they're valid
    const leagueStats: LeagueStats = (req.query.season && req.query.seasonType && 
        checkQueryParams(league, Number(req.query.season), Number(req.query.seasonType))) ?

        await parseLeageStatsResponse(teams, league.toUpperCase(), sport.toLowerCase(), req.query.season.toString(), req.query.seasonType.toString()) :
        await parseLeageStatsResponse(teams, league.toUpperCase(), sport.toLowerCase());

    
    res.render('league_stats', {port: port, sport: sport, league: league.toUpperCase(), leagueStats: leagueStats});
    
})


/**
 * This will be the route that gives us the standings for the requested league
 */
app.get('/:sport/:league/standings', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    //check request params
    if (!checkRequestParams(sport, league)){
        res.status(400).send("Invalid sport or league");
        return;
    }
    //base endpoint we will send a request to for every team
    const endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/`;

    //get correct team array that contains string values of the team abbreviations
    const teamIDs = (league.toUpperCase() == "NFL") ? nflTeams : (league.toUpperCase() == "NBA") ? nbaTeams :
        (league.toUpperCase() == "MLB") ? mlbTeams : nhlTeams;

    //the standings data of all the teams
    const teamStandings: LeagueStandings = await parseStandingsResponse(endpoint, teamIDs, league.toUpperCase());

    res.render('league_standings', {port: port, sport: sport, league: league.toUpperCase(), teamStandings: teamStandings});
})



app.get('/:sport/:league/leaders', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Invalid sport or league");
        return;
    }

    //our baseendpoint to use for the leaders info
    const baseEndpoint = `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league.toLowerCase()}/seasons/`;

    //we need to use this to get the current season year and type, so we can send the correct request to 
    // the leaders endpoint. If the season and season type query params are provided, we will use those 
    // instead to send the request
    const yearAndTypeResponse = await getBasicResponseInfo(
        `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`);
    
    //get the current year and season type to use in case query params aren't provided
    if (req.query.season !== undefined && req.query.seasonType !== undefined){
        if (!checkQueryParams(league, Number(req.query.season), Number(req.query.seasonType))){
            res.status(400).send("Invalid query params");
            return;
        }
    }

    //the full endpoint to send requests to for the leader data
    const paramsEndpoint = (req.query.season !== undefined && req.query.seasonType !== undefined) ?
        `${baseEndpoint}${req.query.season}/types/${req.query.seasonType}/leaders` : 
        `${baseEndpoint}${yearAndTypeResponse.seasonYear}/types/${yearAndTypeResponse.seasonType}/leaders`;
    
    const data = await parseLeaderData(paramsEndpoint);

    const reqYear = (req.query.season) ? Number(req.query.season) : yearAndTypeResponse.seasonYear;
    const reqSeasonName = (req.query.seasonType) ? 
        (req.query.seasonType == "2") ? "Regular Season" : "Postseason"
        : (yearAndTypeResponse.seasonType == 2) ? "Regular Season" : "Postseason";

    res.render('league_leaders', {port: port, sport: sport, league: league.toUpperCase(), 
        data: data, currentYear: yearAndTypeResponse.seasonYear, reqYear: reqYear, reqSeasonName: reqSeasonName});
})

/**
 * This route will be for getting the stats of a specific player
 */
app.get('/:sport/:league/player/:playerID', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const playerID = req.params.playerID;

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Invalid sport or league");
        return;
    }

    //make sure playerID param is actually a number
    if (isNaN(Number(playerID))){
        res.status(400).send("Invalid player ID");
        return;
    }

    //get the basic info of player like name, position, team, etc
    const playerInfo: BasicPlayerStats = await parseBasicPlayerStats(league.toLowerCase(), sport, playerID);
    //get the basic stats of player, like regular season stats, career, postseason
    const playerOverview: PlayerStatsOverview = await parseMainPlayerStats(league.toLowerCase(), sport, playerID);

    //if the main stats aren't available, neither will the splits, so just render the basic stats
    if (playerOverview === null){
        res.render('player_stats', {port: port, sport: sport, league: league, playerInfo: playerInfo, 
            playerOverview: null, playerSplits: null});
        return;
    }

    //get advanced splits of a player
    const playerSplits: PlayerSplits = await parsePlayerSplits(league.toLowerCase(), sport, playerID);

    res.render('player_stats', {port: port, sport: sport, league: league, playerInfo: playerInfo, 
        playerOverview: playerOverview, playerSplits: playerSplits});
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

export default port;