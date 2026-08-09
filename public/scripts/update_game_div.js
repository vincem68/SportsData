//I'm going to put the code in here to update the small game displays to be used in the selected team page
//as well as the overal league schedule page



//use this function to set up game divs when the page is open while a game begins 
export function setUpGameDiv(gameDiv, gameData, league){
    //get the game elements 
    const status = gameDiv.querySelector('.status');
    const score = gameDiv.querySelector('.score');
    const baseballInfoDiv = gameDiv.querySelector('.baseballInfoDiv');
    const mlbCount = gameDiv.querySelector('.mlbCount');
    const basesImg = gameDiv.querySelector('.basesImg');
    const yardMarker = gameDiv.querySelector('.yardMarker');
    const arrowImage = gameDiv.querySelector('.arrow_img');
    const seriesRecord = gameDiv.querySelector('.seriesRecord');

    //hide series record for active games
    seriesRecord.style.display = "none";

    //update the status of the game
    status.textContent = gameData.status.shortDetail;

    //update baseball count if in MLB game
    if (league == "MLB"){
        baseballInfoDiv.style.display = 'flex';
        basesImg.src = '/images/empty.PNG';
        mlbCount.textContent = gameData.situation !== undefined ? 
            gameData.situation.count + " " + gameData.situation.outs + " outs" : "";
    } else {
        baseballInfoDiv.style.display = 'none';
    }

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
    const yardMarker = gameDiv.querySelector('.yardMarker');
    const arrowImage = gameDiv.querySelector('.arrow_img');
    const seriesRecord = gameDiv.querySelector('.seriesRecord');
    const baseballInfoDiv = gameDiv.querySelector('.baseballInfoDiv');
    const basesImg = gameDiv.querySelector('.basesImg');

    //update the status of the game
    status.textContent = gameData.status.shortDetail;
    //get score of game
    score.textContent = gameData.awayTeam.score + " - " + gameData.homeTeam.score;

    //update baseball count if in MLB game
    if (league == "MLB"){
        mlbCount.textContent = gameData.situation !== undefined ? 
            gameData.situation.count + "    " + gameData.situation.outs + " outs" : "";
        basesImg.src = gameData.situation !== undefined ? 
            getBasesCombo(gameData.situation.onFirst, gameData.situation.onSecond, gameData.situation.onThird) : '/images/empty.PNG';
    }

    //if the game is now finished, hide the needed elements and finalize data
    if (gameData.status.state == "post"){

        //hide any baseball and football in game details
        baseballInfoDiv.style.display = 'none';
        yardMarker.style.display = "none";
        arrowImage.style.display = "none";

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
            onFirst: competition.situation.onFirst,
            onSecond: competition.situation.onSecond,
            onThird: competition.situation.onThird,
            outs: competition.situation.outs
        } : undefined,
        seriesSummary: competition.series?.summary || ''
    };
}

export function getBasesCombo(first, second, third) {

    if (!first && !second && !third){
        return "/images/empty.png";
    }

    if (first && !second && !third){
        return "/images/1st.png";
    }

    if (!first && second && !third){
        return "/images/2nd.png";
    }

    if (!first && !second && third){
        return "/images/3rd.png";
    }

    if (first && second && !third){
        return "/images/1st2nd.png";
    }

    if (first && !second && third){
        return "/images/1st3rd.png";
    }

    if (!first && second && third){
        return "/images/2nd3rd.png";
    }

    if (first && second && third){
        return "/images/loaded.png";
    }

}