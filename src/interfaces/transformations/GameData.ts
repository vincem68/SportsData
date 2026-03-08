import type { GameSpecificOverview, GameSpecificOverviewResponse, 
    GameSpecificSummaryResponse, GameSpecificSummary } from "../types/GameData.types";
/**
 * Function to parse the GameOverviewResponse from ESPN into a more manageable GameOverview object
 * @param response JSON response from ESPN containing game info
 * @returns a variable of type GameOverview to have needed JSON info much more organized and readable
 */
export const parseOverview = (response: GameSpecificOverviewResponse, league: string): GameSpecificOverview => {

    const competition = response.competitions[0];
    const awayCompetitor = competition.competitors[1];
    const homeCompetitor = competition.competitors[0];

    console.log(league);

    return {
        id: response.id,
        date: response.date,
        seasonType: response.season.type,

        awayTeam: {
            id: awayCompetitor.id,
            abbreviation: awayCompetitor.team.abbreviation,
            name: awayCompetitor.team.displayName,
            logo: awayCompetitor.team.logo,
            score: awayCompetitor.score,
            record: awayCompetitor.records[0].summary
        },

        homeTeam: {
            id: homeCompetitor.id,
            abbreviation: homeCompetitor.team.abbreviation,
            name: homeCompetitor.team.displayName,
            logo: homeCompetitor.team.logo,
            score: homeCompetitor.score,
            record: homeCompetitor.records[0].summary
        },

        status: {
            state: competition.status.type.state,
            shortDetail: competition.status.type.shortDetail,
            period: competition.status.period,
            displayClock: competition.status.displayClock
        },

        situation: competition.situation ? {
            downDistanceText: league == "NFL" ? competition.situation.downDistanceText : undefined,
            possession: league == "NFL" ? competition.situation.possession : undefined,
            count: league == "MLB" ? competition.situation.batter!.summary : undefined,
            outs: league == "MLB" ? competition.situation.outs : undefined,
            pitcher: league == "MLB" && competition.situation.pitcher ? {
                name: competition.situation.pitcher.athlete.shortName,
                headshot: competition.situation.pitcher.athlete.headshot
            } : undefined,
            batter: league == "MLB" && competition.situation.batter ? {
                name: competition.situation.batter.athlete.shortName,
                headshot: competition.situation.batter.athlete.headshot
            } : undefined

        } : undefined,

        seriesSummary: competition.series?.summary || '',

        linescore : {
            intervalLength: competition.format.regulation.periods,
            
            intervals: getIntervalLabels(
                competition.format.regulation.periods, 
                league, 
                competition.competitors[0].linescores ? competition.competitors[0].linescores.length : 0, 
                response.season.type == 3
            ),

            //for the linescore totals, we should parse so we have empty spaces for futre intervals
            awayLinescore: competition.competitors[1].linescores 
                ? parseLinescoreTotals(
                    competition.competitors[1].linescores.map(linescore => linescore.displayValue), 
                    competition.format.regulation.periods
                ) : league == "MLB" ? ['','','','','','','','',''] : league == "NHL" ? ['','',''] : ['','','',''],

            homeLinescore: competition.competitors[0].linescores 
                ? parseLinescoreTotals(
                    competition.competitors[0].linescores.map(linescore => linescore.displayValue),
                    competition.format.regulation.periods
                ): league == "MLB" ? ['','','','','','','','',''] : league == "NHL" ? ['','',''] : ['','','',''],

            awayRuns: league == "MLB" ? competition.competitors[1].statistics[1].displayValue : undefined,
            awayHits: league == "MLB" ? competition.competitors[1].statistics[0].displayValue : undefined,
            awayErrors: league == "MLB" ? competition.competitors[1].statistics[7].displayValue : undefined,
            homeRuns: league == "MLB" ? competition.competitors[0].statistics[1].displayValue : undefined,
            homeHits: league == "MLB" ? competition.competitors[0].statistics[0].displayValue : undefined,
            homeErrors: league == "MLB" ? competition.competitors[0].statistics[7].displayValue : undefined
        }
    };
}


/**
 * 
 * @param response 
 * @param league 
 * @returns 
 */
export const parseSummary = (response: GameSpecificSummaryResponse, league: string): GameSpecificSummary => {

    //if its a hockey game, filter out skaters category
    if (response.boxscore.players && league == "NHL") {
        response.boxscore.players[0].statistics = 
            response.boxscore.players[0].statistics.filter(cat => cat.name != "skaters");
        
        response.boxscore.players[1].statistics = 
            response.boxscore.players[1].statistics.filter(cat => cat.name != "skaters");
    }

    //for NBA games, filter out the players that have no stats
    if (league == "NBA" && response.boxscore.players) { //if its an NBA game, filter out the overall category since it is redundant with the team stats
        response.boxscore.players[0].statistics[0].athletes = 
            response.boxscore.players[0].statistics[0].athletes.filter(athlete => !athlete.didNotPlay);

        response.boxscore.players[0].statistics[0].athletes = 
            response.boxscore.players[0].statistics[0].athletes.filter(athlete => !athlete.didNotPlay);
        //shorten the abbreviation here
        response.boxscore.teams[0].statistics[18].abbreviation = "PCOT";
        response.boxscore.teams[1].statistics[18].abbreviation = "PCOT";
    }

    return {

        //the abbreviations of the teams
        awayTeamAbbr: response.boxscore.teams[0].team.abbreviation,
        homeTeamAbbr: response.boxscore.teams[1].team.abbreviation,

        gameState: response.meta.gameState, //the state of the game

        //here's the season/game stats of the overall teams
        awayTeamStats: response.boxscore.teams[0].statistics.map(stat => ({
            //if abbreviation doesn't exist, should be label
            label: stat.abbreviation ? stat.abbreviation : stat.label!,
            value: stat.displayValue
        })),

        homeTeamStats: response.boxscore.teams[1].statistics.map(stat => ({
            //same as above comment
            label: stat.abbreviation ? stat.abbreviation : stat.label!,
            value: stat.displayValue
        })),

        awayLeaders: response.meta.gameState != "in" && league != "MLB" ? response.leaders[0].leaders.map(leader => ({

            category: leader.displayName,
            athleteName: leader.leaders[0].athlete.shortName,

            //NFL response data will have a different JSON structure
            athleteHeadshot: (typeof leader.leaders[0].athlete.headshot === "string") ? 
                leader.leaders[0].athlete.headshot : leader.leaders[0].athlete.headshot.href ?? "",

            value: leader.leaders[0].displayValue

        })) : undefined,
        
        homeLeaders: response.meta.gameState != "in" && league != "MLB" ? response.leaders[1].leaders.map(leader => ({

            category: leader.displayName,
            athleteName: leader.leaders[0].athlete.shortName,

            athleteHeadshot: (typeof leader.leaders[0].athlete.headshot === "string") ?
                leader.leaders[0].athlete.headshot : leader.leaders[0].athlete.headshot.href ?? "",

            value: leader.leaders[0].displayValue

        })) : undefined,

        awayPlayerStats: response.boxscore.players ?
        
            response.boxscore.players[0].statistics.map(category => ({

                categoryName: league == "NBA" ? "OVERALL" 
                    : category.name ? category.name.split(/(?=[A-Z])/).map(word => word.toUpperCase()).join(" ") 
                    : category.type!.toUpperCase(),

                tableID: category.name ? response.boxscore.teams[0].team.abbreviation + category.name :
                     category.type ? response.boxscore.teams[0].team.abbreviation + category.type :
                     response.boxscore.teams[0].team.abbreviation + "overall",

                catLabelsAndDescs: category.labels.map((label, index) => ({
                    label: label,
                    desc: category.descriptions[index]
                })),

                players: category.athletes.map(player => ({
                    rowID: "athlete-" + player.athlete.id,
                    athleteName: player.athlete.shortName ? player.athlete.shortName : 
                        player.athlete.firstName![0] + ". " + player.athlete.lastName!,
                    starter: player.starter !== undefined ? player.starter : undefined,
                    position: (league == "MLB") ? player.athlete.position!.abbreviation : undefined,
                    batOrder: (league == "MLB") ? player.batOrder : undefined,
                    stats: player.stats
                }))
            })) 
            
            : undefined,

            homePlayerStats: response.boxscore.players ?
        
                response.boxscore.players[1].statistics.map(category => ({

                    categoryName: league == "NBA" ? "OVERALL" 
                    : category.name ? category.name.split(/(?=[A-Z])/).map(word => word.toUpperCase()).join(" ") 
                    : category.type!.toUpperCase(),

                    tableID: category.name ? response.boxscore.teams[1].team.abbreviation + category.name :
                        category.type ? response.boxscore.teams[1].team.abbreviation + category.type :
                        response.boxscore.teams[0].team.abbreviation + "overall",

                    catLabelsAndDescs: category.labels.map((label, index) => ({
                        label: label,
                        desc: category.descriptions[index]
                    })),

                    players: category.athletes.map(player => ({
                        rowID: "athlete-" + player.athlete.id,
                        athleteName: player.athlete.shortName ? player.athlete.shortName : 
                            player.athlete.firstName![0] + ". " + player.athlete.lastName!,
                        position: (league == "MLB") ? player.athlete.position!.abbreviation : undefined,
                        starter: player.starter !== undefined ? player.starter : undefined,
                        batOrder: (league == "MLB") ? player.batOrder : undefined,
                        stats: player.stats
                    }))
                })) 
                
            : undefined
    }
}


/**
 * A helper function to generate the interval labels for the linescore, such as 1, 2, 3, ... OT, SO, etc.
 * It will return the correct names of intervals, which include the numbered quarters/innings/periods plus 
 * OT, 2OT, SO, etc.
 */
function getIntervalLabels(regFormat: number, league: string, linescoreLength: number, postseason: boolean): string[] {
    const intervals = Array.from({ length: regFormat }, (_, i) => (i + 1).toString());
    console.log(intervals);

    if (intervals.length > regFormat) { //if we have more intervals then the regulation amount

        if (league == "NHL" && !postseason) { //if NHL and not postseason, just OT and maybe SO

            const extraIntervals = (linescoreLength - regFormat == 2) ? ["OT", "SO"] : ["OT"];
            intervals.push(...extraIntervals);

        } else if (league != "MLB") { //otherwise, for everything but baseball, make it OT, 2OT, etc
            const extraIntervals = Array.from({ length: linescoreLength - regFormat }, (_, i) => `${i + 1}OT`);
            intervals.push(...extraIntervals);
        }
    }

    return intervals;
}

/**
 * Formats a linescore array we get from the JSON data. Because some arrays might not be at full length
 * when the game is active, we should add in a full array with empty strings to be consistent. For example, 
 * if the game is in the 7th inning when there will be 9 innings, we should put in empty strings for the 
 * 8th and 9th inning
 * @param linescores the active linescores array we get from the game
 * @param intervalLength the current length of the linescore array, since during games it may not be 
 * the full regulation mount from JSON response
 * @returns a formatted linescore array with empty strings for any future intervals that haven't happened yet
 */
function parseLinescoreTotals(linescores: string[], intervalLength: number): string[] {

    if (linescores.length < intervalLength) {
        const emptyScores = Array.from({ length: intervalLength - linescores.length }, () => '');
        return [...linescores, ...emptyScores];
    }
    return linescores;
}