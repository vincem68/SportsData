import {Router, Request, Response} from 'express';
import port from '../index';

import { checkRequestParams } from '../validation_functions';

import { TeamResponse, Team} from '../interfaces/Team';
import { TeamInfoResponse, TeamInfo } from '../interfaces/TeamInfo';
import { TeamNews, TeamNewsResponse } from '../interfaces/TeamNews';
import { GameOverview, GameOverviewResponse, parseGameOverviewResponse} from '../interfaces/GameOverview';

const router = Router({ mergeParams: true });

/**
 * Used when the user has selected a specific team
 */
router.get('/:team/roster', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    if (!checkRequestParams(sport, league)){
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

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

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
router.get('/:team/stats', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const team = req.params.team;

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

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
        recordSummary: data.team.record.items.length > 0 ? data.team.record.items[0].summary : '',
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
    const gameID = data.team.nextEvent[0].id;
    const nextGameEndpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard/${gameID}`;
    const gameResponse: GameOverviewResponse = await (await fetch(nextGameEndpoint)).json();
    const game: GameOverview = parseGameOverviewResponse(gameResponse);

    res.render('selected_team', {port: port, sport: sport, league: league.toUpperCase(), 
        team: team, data: teamData, news: newsArticles, game: game, parseResponse: parseGameOverviewResponse});
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
    
    const response = await fetch(`http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
    const data: TeamResponse = await response.json();
    const teams: Team[] = data.sports[0].leagues[0].teams.map((teamWrapper) => teamWrapper.team);
    res.render('team_selection', {port: port, sport: sport, league: league.toUpperCase(), teams: teams});
})

export default router;