import {Router, Request, Response} from 'express';
import port from '../index';

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
    res.render('scheduled_games', { port: port, sport: sport, league: league.toUpperCase(), data: data, endpoint: endpoint});
})

export default router;