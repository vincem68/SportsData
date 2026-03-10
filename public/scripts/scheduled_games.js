const form = document.getElementById("dateSelection");
const dateInput = document.getElementById('date');

//selectors
const typeSelector = document.getElementById('typeSelector');
const weekSelector = document.getElementById('weekSelector');

//divs
const upcomingGames = document.getElementById('upcomingGames');
const activeGames = document.getElementById('activeGames');
const completedGames = document.getElementById('completedGames');
const headlines = document.querySelectorAll('.sectionHeadline');
const upcoming = document.getElementById('upcomingHeadline');


//hide game active sections within the games yet to start
upcomingGames.querySelectorAll('.gameContainer').forEach(game => {
    game.querySelector('.score').style.display = 'none';
    game.querySelector('.mlbCount').style.display = 'none';
    game.querySelector('.yardMarker').style.display = 'none';
    game.querySelector('.arrow_img').style.display = 'none';
});

//hide mlb count and football marker in the finished games
completedGames.querySelectorAll('.gameContainer').forEach(game => {
    game.querySelector('.mlbCount').style.display = 'none';
    game.querySelector('.yardMarker').style.display = 'none';
    game.querySelector('.arrow_img').style.display = 'none';
});

activeGames.querySelectorAll('.gameContainer').forEach(game => {
    if (league != "MLB"){
        game.querySelector('.mlbCount').style.display = 'none';
    }
    if (league != "NFL"){
        game.querySelector('.arrow_img').style.display = 'none';
        game.querySelector('.yardMarker').style.display = 'none';
    }
});

//hide the headlines if the divs containing these games have none
headlines[0].style.display = (activeGames.children.length == 0) ? 'none' : 'flex';
headlines[1].style.display = (upcomingGames.children.length == 0) ? 'none' : 'flex';
headlines[2].style.display = (completedGames.children.length == 0) ? 'none' : 'flex';


/**
 * Function to get the proper week options based on season type selected
 * This is used mainly for football games, set up regular season weeks from weeks 1-18, 
 * and for the postseason, match the round names to the correspendonding week values
 */
function getOptions(){

    const type = typeSelector.value;
    weekSelector.innerHTML = '';

    if (type == "2"){
        
        for (let i = 1; i < 19; i++){
            const option = document.createElement('option');
            option.value = i;
            option.textContent = "Week " + i.toString();
            weekSelector.appendChild(option);
        }

    } else {

        const postseasonGames = [{key: 1, value: "Wild Card"}, {key: 2, value: "Divisional"},
            {key: 3, value: "Conference"}, {key: 5, value: "Super Bowl"}];
        
        postseasonGames.forEach(round => {
            const option = document.createElement('option');
            option.value = round.key;
            option.textContent = round.value;
            weekSelector.appendChild(option);
        });
    }
}

if (typeSelector){ //if its for football games, add listener for week selection

    typeSelector.addEventListener('change', getOptions);
    getOptions();

} else { //otherwise, add listener for date selection

    form.addEventListener("submit", function() {
        const dateValue = date.value;

        if (!dateValue) {
            event.preventDefault();
            alert('Please select a date.');
            return;
        }
    });
}


/**
 * Function to update all games on the page
 * Check on both active and upcoming games for status changes and to move gameDivs to proper
 * container divs 
 */
async function updateGames(){

    console.log("hello");

    //get the data from the response
    const updatedGames = await parseLeagueScheduleResponse();

    //first go through upcoming games to see if any have started
    upcomingGames.querySelectorAll('.gameContainer').forEach(gameDiv => {

        const gameID = gameDiv.id;
        //find the specific game in the upcomingGames portion of response
        const gameData = updatedGames.upcomingGames.find(event => event.id == gameID);

        //if the game has started, move it to active games
        if (gameData.status.state != "pre"){
            //get the game elements 
            const status = gameDiv.querySelector('.status');
            const score = gameDiv.querySelector('.score');
            const mlbCount = gameDiv.querySelector('.mlbCount');
            const yardMarker = gameDiv.querySelector('.yardMarker');
            const arrowImage = gameDiv.querySelector('.arrow_img');
            const seriesRecord = gameDiv.querySelector('.seriesRecord');

            //hide series record for active games
            seriesRecord.style.display = "none";

            //update the status of the game
            status.textContent = gameData.status.shortDetail;

            //update baseball count if in MLB game
            mlbCount.style.display = (league == "MLB" && gameData.situation !== undefined) ? "flex" : "none";
            mlbCount.textContent = (league == "MLB" && gameData.situation !== undefined) ? 
                gameData.situation.balls + "-" + gameData.situation.strikes +  " " + 
                    gameData.situation.outs + " outs" : "";

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

            gameDiv.parentNode.removeChild(gameDiv); //remove from upcoming

            //add to active games
            if (activeGames.children.length == 0){
                headlines[0].style.display = 'flex';
            }
            if (upcomingGames.children.length == 0){
                headlines[1].style.display = 'none';
            }
            activeGames.appendChild(gameDiv);
        }
    });

    activeGames.querySelectorAll('.gameContainer').forEach(gameDiv => {

        const gameID = gameDiv.id;
        const gameData = updatedGames.activeGames.find(event => event.id == gameID);

        const status = gameDiv.querySelector('.status');
        const score = gameDiv.querySelector('.score');
        const mlbCount = gameDiv.querySelector('.mlbCount');
        const yardMarker = gameDiv.querySelector('.yardMarker');
        const arrowImage = gameDiv.querySelector('.arrow_img');
        const seriesRecord = gameDiv.querySelector('.seriesRecord');

        //update the status of the game
        status.textContent = gameData.status.shortDetail;

        //get score of game
        score.textContent = gameData.awayTeam.score + " - " + gameData.homeTeam.score;

        //if the game is now finished, move it to completed games
        if (gameData.status.state == "post"){

            //hide any baseball and football in game details
            mlbCount.style.display = "none";
            yardMarker.style.display = "none";
            arrowImage.style.display = "none";

            //for series score updates on final games
            if (gameData.seriesSummary !== undefined){
                seriesRecord.style.display = "flex";
                seriesRecord.textContent = gameData.seriesSummary;
            } else {
                seriesRecord.style.display = "none";
            }

            gameDiv.parentNode.removeChild(gameDiv); //remove from active

            //add to completed games
            if (completedGames.children.length == 0){
                headlines[2].style.display = 'flex';
            }
            //hide activeGames headline if no more active games
            if (activeGames.children.length == 0){
                headlines[0].style.display = 'none';
            }
            completedGames.appendChild(gameDiv);
        }
    });

    if (activeGames.children.length == 0 && upcomingGames.children.length == 0){
        clearInterval(requests);
    }
}

let requests = setInterval(updateGames, 10000); //update games every 20 seconds
//immediately clear it if all games are already final upon initial page load or user refresh
if (activeGames.children.length == 0 && upcomingGames.children.length == 0){
    clearInterval(requests);
}

//divy up the games into active, upcoming, and completed based on their status
async function parseLeagueScheduleResponse() {

    const response = await (await fetch(endpoint)).json();
    const parsedGames = response.events.map(event => parseGame(event));
    console.log(parsedGames);

    return {
        activeGames: parsedGames.filter(game => game.status.state === "in"),
        upcomingGames: parsedGames.filter(game => game.status.state === "pre"),
        completedGames: parsedGames.filter(game => game.status.state === "post")
    }
}

function parseGame(game) {

    const competition = game.competitions[0];
    const awayCompetitor = game.competitions[0].competitors[1];
    const homeCompetitor = game.competitions[0].competitors[0];

    return {
        id: game.id,
        seasonType: game.season.type,
        awayTeam: {
            id: awayCompetitor.id,
            score: awayCompetitor.score
        },
        homeTeam: {
            id: homeCompetitor.id,
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
            balls: competition.situation.balls,
            strikes: competition.situation.strikes,
            outs: competition.situation.outs
        } : undefined,
        seriesSummary: competition.series?.summary || ''
    };
}