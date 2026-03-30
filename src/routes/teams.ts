import {Router, Request, Response} from 'express';
import port from '../index';

import { checkRequestParams, checkQueryParams, getBasicResponseInfo } from '../validation_functions';

import type { TeamResponse, Team} from '../interfaces/types/Team.types';
import type { TeamInfoResponse, TeamInfo } from '../interfaces/types/TeamInfo.types';
import type { TeamNews, TeamNewsResponse } from '../interfaces/types/TeamNews.types';
import type { GameOverview, GameOverviewResponse} from '../interfaces/types/LeagueSchedule.types';
import type { TeamStatsResponse, TeamStats } from '../interfaces/types/TeamStats.types';
import type { NFLSchedule } from '../interfaces/types/NFLSchedules.types';
import type { Calendar } from '../interfaces/types/Calendar.types';

import { parseNFLScheduleResponse } from '../interfaces/transformations/NFLSchedules';
import { parseGame } from '../interfaces/transformations/LeagueSchedule';
import { parseTeamStatsResponse } from '../interfaces/transformations/TeamStats';
import { parseTeamResponse } from '../interfaces/transformations/Team';
import { parseCalendarResponse } from '../interfaces/transformations/Calendar';

const router = Router({ mergeParams: true });

/**
 * Used when the user has selected a specific team
 */
router.get('/:team/roster', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    if (!checkRequestParams(sport, league, team)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/' + 
        `${sport}/${league}/teams/${team}/roster`);
    
    const data = await response.json();
    res.render('team_roster', {port: port, league: league, sport: sport, team: team, data: data});
})

/**
 * This route will get the schedule for the specified team
 */
router.get('/:team/schedule', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    if (!checkRequestParams(sport, league, team)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

    //get the current season and year as default values
    const defaultQueries = await getBasicResponseInfo(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/schedule`);
    let requestedYear = defaultQueries.seasonYear;
    let requestedType = defaultQueries.seasonType;

    //usual check on the params, reassign the requested season and season type if the query params check out
    if (req.query.season !== undefined && req.query.seasonType !== undefined){
        if (checkQueryParams(league, Number(req.query.season), Number(req.query.seasonType))){
            requestedYear = Number(req.query.season);
            requestedType = Number(req.query.seasonType);
        }
    }

    //get the structired data based off of what kind of sport and season type the user requests
    const data = league.toLowerCase() === "nfl" ? await parseNFLScheduleResponse(team, requestedYear, requestedType) 
        : await parseCalendarResponse(league, sport, team, requestedYear, requestedType);

    res.render('team_schedules/team_schedule', {port: port, team: team, league: league.toUpperCase(), 
        sport: sport, data: data});

})

/**
 * This route will be for the stats of a team.
 */
router.get('/:team/stats', async function(req: Request, res: Response){

    //url params
    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    //check the params in URL
    if (!checkRequestParams(sport, league, team)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

    //base endpoint
    let endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/statistics`;

    //check query params, add on to base endpoint if queries check out
    if (req.query.season !== undefined && req.query.seasonType !== undefined){
        if (checkQueryParams(league, Number(req.query.season), Number(req.query.seasonType))){
            endpoint += `?season=${req.query.season}&seasontype=${req.query.seasonType}`;
        }
    }

    const teamData: TeamStatsResponse = await (await fetch(endpoint)).json();
    const teamStats: TeamStats = parseTeamStatsResponse(teamData, league);
    

    res.render('team_stats', {port: port, league: league.toUpperCase(), teamStats: teamStats });
})

/**
 * This will act as sort of the home page for the selected team. Will feature the logo, any scheduled games, 
 * and the links to the roster, stats or schedule pages
 */
router.get('/:team', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    if (!checkRequestParams(sport, league, team)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

    const dataEndpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}`;
    const newsEndpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news?team=${team}`;

    //get basic team data
    const data: TeamInfoResponse = await (await fetch(dataEndpoint)).json();
    const teamData: TeamInfo = {
        displayName: data.team.displayName,
        recordSummary: data.team.record.items !== undefined ? data.team.record.items[0].summary : '',
        logoUrl: data.team.logos[0].href,
        gameID: data.team.nextEvent.length > 0 ? data.team.nextEvent[0].id : ''
    };
    //get news on team
    const news: TeamNewsResponse = await (await fetch(newsEndpoint)).json();
    const newsArticles: TeamNews[] = news.articles.map((article) => {{
        return {
            headline: article.headline,
            description: article.description,
            imageUrl: article.images.length > 0 ? article.images[0].url : '',
            articleUrl: article.links.length > 0 ? article.links[0].web.href : ''
        }
    }});

    //get details for previous or next scheduled game
    if (teamData.gameID === '') { //if there is no available data for a next game
        res.render('selected_team', {port: port, sport: sport, league: league.toUpperCase(), 
            team: team, data: teamData, news: newsArticles, game: null, parseResponse: parseGame});
        return;
    }

    //otherwise, 
    const gameID = data.team.nextEvent[0].id;
    const nextGameEndpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard/${gameID}`;
    const gameResponse: GameOverviewResponse = await (await fetch(nextGameEndpoint)).json();
    const game: GameOverview = parseGame(gameResponse);

    res.render('selected_team', {port: port, sport: sport, league: league.toUpperCase(), 
        team: team, data: teamData, news: newsArticles, game: game, parseResponse: parseGame});
})

/**
 * This will be for sending the user to the teams page. Get JSON data of all teams in a league and 
 * display them all
 */
router.get('/', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }
    //get the teams for the league
    const teams: Team[] = await parseTeamResponse(`http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
    
    res.render('team_selection', {port: port, sport: sport, league: league.toUpperCase(), teams: teams});
})

export default router;