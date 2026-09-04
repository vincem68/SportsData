import {Router, Request, Response} from 'express';
import port from '../index';

import { checkRequestParams } from '../utility_functions';


import type { LeagueSchedule } from '../interfaces/types/LeagueSchedule.types';
import type { GameOverview } from '../interfaces/types/LeagueSchedule.types';
import type { GameSpecificSummary } from '../interfaces/types/GameData.types';


import { parseLeagueScheduleResponse } from '../interfaces/transformations/LeagueSchedule';
import { parseOverview, parseSummary} from '../interfaces/transformations/GameData';

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

    if (game_id === undefined || isNaN(Number(game_id))){ //check to make sure the h=game ID is a valid int
        res.status(400).send("Bad Request: Invalid or missing Game ID.");
        return;
    }

    if (!checkRequestParams(sport, league)){ //check the params to make sure they are valid
        res.status(400).send("Bad Request: Invalid sport or league parameter.");
        return;
    }

    const overview: GameOverview = await parseOverview(league.toUpperCase(), sport, game_id);

    const summary: GameSpecificSummary = await parseSummary(league.toUpperCase(), sport, game_id);

    //maybe we need to see what kinds of data is available in the pre state
    //overview will be used for selected_game, boxscore will be used for the more specific subfile
    res.render('selected_game', {port: port, league: league.toUpperCase(), overview: overview, summary: summary});
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

    const leagueSchedule: LeagueSchedule = req.query.date ? await parseLeagueScheduleResponse(league.toUpperCase(), sport, req.query.date.toString())

        : req.query.season && req.query.week && req.query.seasonType ? 
            await parseLeagueScheduleResponse(league.toUpperCase(), sport, {season: req.query.season.toString(), week: req.query.week.toString(), type: req.query.seasonType.toString()})

        : await parseLeagueScheduleResponse(league.toUpperCase(), sport);


    //render all the data onto the scheduled games page
    res.render('scheduled_games', { port: port, sport: sport, league: league.toUpperCase(),
        leagueSchedule: leagueSchedule});
})

export default router;