import express, {Request, Response} from 'express';
import path from 'path';

import { checkRequestParams, getCurrentSeasonInfo, checkValidSeason } from './validation_functions';

import teamRoutes from './routes/teams';
import gameRoutes from './routes/games';

import { SeasonInfo } from './interfaces/SeasonInfo';
import {TeamStats, LeagueStatsResponse} from './interfaces/LeagueStatsResponse';
import { TeamStandingsData, TeamRecord } from './interfaces/TeamStandings';



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
    'MIL', 'MIN', 'NO', 'NYK', 'OKC', 'ORL', 'PHI', 'PHX', 
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
    'DAL', 'DET', 'EDM', 'FLA', 'LA', 'MIN', 'MTL', 'NJD', 
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

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Invalid sport or league");
        return;
    }
    
    const leagueStats: TeamStats[] = [];

    const queries = (req.query.season !== undefined && req.query.seasonType !== undefined) ? 
        `?season=${req.query.season}&seasontype=${req.query.seasonType}` : "";
    
    let requestedSeason: number = 0;
    let currentType: number = 0;
    
    //set the team array to whichever league we're using
    const teamIDs = (league.toUpperCase() == "NFL") ? nflTeams : (league.toUpperCase() == "NBA") ? nbaTeams :
        (league.toUpperCase() == "MLB") ? mlbTeams : nhlTeams;

    //get the current season of the league
    const currentYearResponse: LeagueStatsResponse = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
        `/teams/${teamIDs[0]}/statistics`)).json();

    //get the current season year so we can send it to the rendered file for the year selector
    let currentSeason = currentYearResponse.season.year;

    //test request to see if available data
    const checkValidResponse: LeagueStatsResponse = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
        `/teams/${teamIDs[0]}/statistics${queries}`)).json();

    //check if code 404 exists
    if (checkValidResponse.code === undefined) {
        //loop through the teams array and make a call on each ID to get that teams data, and render the data
        for (const team of teamIDs){

            let endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}` + 
            `/teams/${team}/statistics${queries}`;

            const teamData: LeagueStatsResponse = await (await fetch(endpoint)).json();

            if (requestedSeason == 0){
                requestedSeason = teamData.requestedSeason.year;
                currentType = teamData.season.type;
                currentSeason = teamData.season.year;
            }

            //if we're asking for postseason stats, only add teams that qualified
            if (req.query.seasonType == "3"){
                if (teamData.requestedSeason.qualifiedPostSeason){
                    const teamStats: TeamStats = {teamName: team, categories: teamData.results.stats.categories};
                    leagueStats.push(teamStats);
                }
            //else, just add like normal
            } else {
                const teamStats: TeamStats = {teamName: team, categories: teamData.results.stats.categories};
                leagueStats.push(teamStats);
            }
        }
    }
    
    res.render('league_stats', {port: port, sport: sport, league: league.toUpperCase(), requestedSeason: requestedSeason, 
        currentSeason: currentSeason, currentType: currentType, leagueStats: leagueStats});
    
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

    const endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/`;
    //get correct team array
    const teamIDs = (league.toUpperCase() == "NFL") ? nflTeams : (league.toUpperCase() == "NBA") ? nbaTeams :
        (league.toUpperCase() == "MLB") ? mlbTeams : nhlTeams;

    //array to store the team data
    const teamStandings: TeamRecord[] = [];

    //start sending requests for data
    for (const team of teamIDs){
        const teamData: TeamStandingsData = await (await fetch(endpoint + team)).json();
        if (teamData.team.record.items === undefined){
            break;
        } else {
            const data: TeamRecord = {
                abbreviation: teamData.team.abbreviation,
                logo: teamData.team.logos[0].href,
                gamesPlayed: teamData.team.record.items[0].stats.find(stat => stat.name === "gamesPlayed")?.value || 0,
                playoffSeed: teamData.team.record.items[0].stats.find(stat => stat.name === "playoffSeed")?.value || 0,
                wins: teamData.team.record.items[0].stats.find(stat => stat.name === "wins")?.value || 0,
                losses: teamData.team.record.items[0].stats.find(stat => stat.name === "losses")?.value || 0,
                ties: teamData.team.record.items[0].stats.find(stat => stat.name === "ties")?.value,
                otLosses: teamData.team.record.items[0].stats.find(stat => stat.name === "otLosses")?.value,
                points: teamData.team.record.items[0].stats.find(stat => stat.name === "points")?.value,
                winPercent: teamData.team.record.items[0].stats.find(stat => stat.name === "winPercent")?.value,
                standingSummary: teamData.team.standingSummary
            };
            teamStandings.push(data);
        }
    }

    res.render('league_standings', {port: port, sport: sport, league: league.toUpperCase(), teamStandings: teamStandings});
})

app.get('/:sport/:league/leaders', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Invalid sport or league");
        return;
    }

    let leadersEndpoint = `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/` +
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

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Invalid sport or league");
        return;
    }

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

export default port;