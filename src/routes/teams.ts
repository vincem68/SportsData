import {Router, Request, Response} from 'express';
import port from '../index';

import { checkRequestParams, checkQueryParams, getBasicResponseInfo } from '../validation_functions';

import type { Team} from '../interfaces/types/Team.types';
import type { TeamInfoResponse, TeamInfo } from '../interfaces/types/TeamInfo.types';
import type { TeamNews, TeamNewsResponse } from '../interfaces/types/TeamNews.types';
import type { TeamStats } from '../interfaces/types/TeamStats.types';
import type { NFLSchedule } from '../interfaces/types/NFLSchedules.types';
import type { Calendar } from '../interfaces/types/Calendar.types';
import type { PostseasonSchedule } from '../interfaces/types/PostseasonSeries.types';
import type { RosterData } from '../interfaces/types/Roster.types';

import { parseNFLScheduleResponse } from '../interfaces/transformations/NFLSchedules';
import { parseTeamStatsResponse } from '../interfaces/transformations/TeamStats';
import { parseTeamResponse } from '../interfaces/transformations/Team';
import { parseCalendarResponse } from '../interfaces/transformations/Calendar';
import { parsePostseasonScheduleResponse } from '../interfaces/transformations/PostseasonSeries';
import { parseRosterData } from '../interfaces/transformations/Roster';
import { parseTeamInfoResponse, parseTeamNewsResponse } from '../interfaces/transformations/TeamInfo';

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

    const rosterData: RosterData = await parseRosterData(league.toUpperCase(), sport, team);

    res.render('team_roster', {port: port, league: league, sport: sport, team: team, data: rosterData});
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
    const data: NFLSchedule | Calendar | PostseasonSchedule = league.toLowerCase() === "nfl" ? 
        await parseNFLScheduleResponse(team, requestedYear, requestedType) :
        requestedType === 3 ? await parsePostseasonScheduleResponse(sport, league, team, requestedYear, requestedType)
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

    //if queries exist for previous season and/or type, add in extra parameters
    const teamStats: TeamStats = (req.query.season && req.query.seasonType && 
        checkQueryParams(league, Number(req.query.season), Number(req.query.seasonType)))

            ? await parseTeamStatsResponse(league.toUpperCase(), sport, team, req.query.season.toString(), req.query.seasonType.toString())

            : await parseTeamStatsResponse(league.toUpperCase(), sport, team);
    

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

    //get basic team data
    const teamData: TeamInfo = await parseTeamInfoResponse(league, sport, team);
    //get news on team
    const newsArticles: TeamNews[] = await parseTeamNewsResponse(league, sport, team);

    res.render('selected_team', {port: port, sport: sport, league: league.toUpperCase(), 
        team: team, data: teamData, news: newsArticles});
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
    const teams: Team[] = await parseTeamResponse(league, sport);
    
    res.render('team_selection', {port: port, sport: sport, league: league.toUpperCase(), teams: teams});
})

export default router;