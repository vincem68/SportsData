import { parseGame, setUpGameDiv, updateGameDiv } from "./update_game_div.js";

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
async function updateCompleteSchedule(){

    console.log("hello");

    //get the data from the response
    const updatedGames = await parseLeagueScheduleResponse(endpoint);

    //first go through upcoming games to see if any have started, and move/update the divs to activeGames
    upcomingGames.querySelectorAll('.gameContainer').forEach(gameDiv => {

        const gameID = gameDiv.id;
        //find the specific game in the upcomingGames portion of response
        const gameData = updatedGames.find(event => event.id == gameID);

        //if null, the game has started. Move to Active Games Div
        if (gameData.status.state != "pre"){
            
            //set up the gameDiv
            setUpGameDiv(gameDiv, gameData, league.toUpperCase());

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

    //here, check to see if any divs containing data on active games has the game concluded, to shift to the completedGamesDiv
    activeGames.querySelectorAll('.gameContainer').forEach(gameDiv => {

        const gameID = gameDiv.id;
        //find the specific game in the upcomingGames portion of response
        const gameData = updatedGames.find(event => event.id == gameID);

        updateGameDiv(gameDiv, gameData, league.toUpperCase());

        //if the game is now finished, move it to completed games
        if (gameData.status.state == "post"){

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

    //when upcoming and active game divs are both empty, all the games for the day are done. Stop sending requests
    if (activeGames.children.length == 0 && upcomingGames.children.length == 0){
        clearInterval(requests);
    }
}

//get the response of full games, and parse the data 
async function parseLeagueScheduleResponse(endpoint) {

    const response = await (await fetch(endpoint)).json();

    return response.events.map(game => parseGame(game));
}



let requests = setInterval(updateCompleteSchedule, 10000); //update games every 20 seconds
//immediately clear it if all games are already final upon initial page load or user refresh
if (activeGames.children.length == 0 && upcomingGames.children.length == 0){
    clearInterval(requests);
}
