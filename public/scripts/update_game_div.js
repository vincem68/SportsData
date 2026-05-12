//I'm going to put the code in here to update the small game displays to be used in the selected team page
//as well as the overal league schedule page



//use this function to set up game divs when the page is open while a game begins 
export function setUpGameDiv(gameDiv, gameData, league){
    //get the game elements 
    const status = gameDiv.querySelector('.status');
    const score = gameDiv.querySelector('.score');
    const mlbCount = gameDiv.querySelector('.mlbCount');
    const mlbOuts = gameDiv.querySelector('.mlbOuts');
    const yardMarker = gameDiv.querySelector('.yardMarker');
    const arrowImage = gameDiv.querySelector('.arrow_img');
    const seriesRecord = gameDiv.querySelector('.seriesRecord');

    //hide series record for active games
    seriesRecord.style.display = "none";

    //update the status of the game
    status.textContent = gameData.status.shortDetail;

    //update baseball count if in MLB game
    mlbCount.style.display = (league == "MLB" && gameData.situation !== undefined) ? "flex" : "none";
    mlbCount.textContent = (league == "MLB" && gameData.situation !== undefined) ? gameData.situation.count : "";
    mlbOuts.style.display = (league == "MLB" && gameData.situation !== undefined) ? "flex" : "none";
    mlbOuts.textContent = (league == "MLB" && gameData.situation !== undefined) ? gameData.situation.outs + " Outs" : "";

    //update football marker if an NFL game
    if (league == "NFL" && gameData.situation !== undefined){
        //display the yard marker and possession arrow
        arrowImage.style.display = "flex";
        yardMarker.style.display = "flex";
        yardMarker.textContent = gameData.situation.downDistanceText;
        //set the image arrow to face the correct team based on possession
        if (gameData.situation.possession == gameData.awayTeam.id){
            arrowImage.src = "/images/left_arrow.png";
        } else {
            arrowImage.src = "/images/right_arrow.png";
        }
    }

    //get score of game
    score.style.display = "flex";
    score.textContent = gameData.awayTeam.score + " - " + gameData.homeTeam.score;

}


export function updateGameDiv(gameDiv, gameData){

    const status = gameDiv.querySelector('.status');
    const score = gameDiv.querySelector('.score');
    const mlbCount = gameDiv.querySelector('.mlbCount');
    const mlbOuts = gameDiv.querySelector('.mlbOuts');
    const yardMarker = gameDiv.querySelector('.yardMarker');
    const arrowImage = gameDiv.querySelector('.arrow_img');
    const seriesRecord = gameDiv.querySelector('.seriesRecord');

    //update the status of the game
    status.textContent = gameData.status.shortDetail;
    //get score of game
    score.textContent = gameData.awayTeam.score + " - " + gameData.homeTeam.score;

    //update baseball count if in MLB game
    mlbCount.style.display = (league == "MLB" && gameData.situation !== undefined) ? "flex" : "none";
    mlbCount.textContent = (league == "MLB" && gameData.situation !== undefined) ? gameData.situation.count : "";
    mlbOuts.style.display = (league == "MLB" && gameData.situation !== undefined) ? "flex" : "none";
    mlbOuts.textContent = (league == "MLB" && gameData.situation !== undefined) ? gameData.situation.outs + " Outs" : "";

    //if the game is now finished, hide the needed elements and finalize data
    if (gameData.status.state == "post"){

        //hide any baseball and football in game details
        mlbCount.style.display = "none";
        yardMarker.style.display = "none";
        arrowImage.style.display = "none";
        mlbOuts.style.display = "none";

        //for series score updates on final games
        if (gameData.seriesSummary !== undefined){
            seriesRecord.style.display = "flex";
            seriesRecord.textContent = gameData.seriesSummary;
        } else {
            seriesRecord.style.display = "none";
        }
    }
}


export function parseGame(data) {

    //if we get three string values, fetch the data, else leave it as is
    //const data = typeof responseOrEndpoint == "string" ? await (await fetch(responseOrEndpoint)).json() : responseOrEndpoint;

    const competition = data.competitions[0];
    const awayCompetitor = competition.competitors[1];
    const homeCompetitor = competition.competitors[0];

    return {
        id: data.id,
        date: data.date,
        seasonType: data.season.type,
        awayTeam: {
            id: awayCompetitor.id,
            abbreviation: awayCompetitor.team.abbreviation,
            name: awayCompetitor.team.displayName,
            logo: awayCompetitor.team.logo,
            score: awayCompetitor.score
        },
        homeTeam: {
            id: homeCompetitor.id,
            abbreviation: homeCompetitor.team.abbreviation,
            name: homeCompetitor.team.displayName,
            logo: homeCompetitor.team.logo,
            score: homeCompetitor.score
        },
        status: {
            state: competition.status.type.state,
            shortDetail: competition.status.type.shortDetail,
            period: competition.status.period,
            displayClock: competition.status.displayClock
        },
        situation: competition.situation ? {
            downDistanceText: competition.situation.downDistanceText,
            possession: competition.situation.possession,
            count: `${competition.situation.balls}-${competition.situation.strikes}`,
            outs: competition.situation.outs
        } : undefined,
        seriesSummary: competition.series?.summary || ''
    };
}