import {Router, Request, Response} from 'express';
import port from '../index';

import { checkRequestParams, checkQueryParams } from '../validation_functions';

import type { LeagueScheduleResponse, LeagueSchedule } from '../interfaces/types/LeagueSchedule.types';
import type { GameOverview, GameOverviewResponse} from '../interfaces/types/GameOverview.types';
import { parseLeagueScheduleResponse } from '../interfaces/transformations/LeagueSchedule';
import {parseGame} from '../interfaces/transformations/GameOverview';
import { parse } from 'path';

const router = Router({ mergeParams: true });

/**
 * This route will be for getting specific game data. Using the game's ID, we can get both the general overview
 * of the game which includes the team logos, scores, game time/status and records, and also get the overall
 * stats for the game's boxscore.
 */
router.get('/:id', async function(req: Request, res: Response){

    const sport = req.params.sport;
    const league = req.params.league;
    const game_id = req.params.id;

    if (!checkRequestParams(sport, league)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

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
router.get('/', async function(req: Request, res: Response) {

    const sport = req.params.sport;
    const league = req.params.league;

    //check the params in URL
    if (!checkRequestParams(sport, league)){
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }
    
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
        endpoint += (checkQueryParams(Number(season), Number(type), Number(week))) ? 
            `?dates=${season}&week=${week}&seasontype=${type}` : '';
    }

    const data: LeagueScheduleResponse = await (await fetch(endpoint)).json();

    const leagueSchedule: LeagueSchedule = parseLeagueScheduleResponse(data);
    //render all the data onto the scheduled games page
    res.render('scheduled_games', { port: port, sport: sport, league: league.toUpperCase(),
        leagueSchedule: leagueSchedule, endpoint: endpoint, parseGame: parseGame});
})

export default router;