import { updateGameDiv, setUpGameDiv, parseGame } from "./update_game_div.js";

const gameID = game.id;
const state = game.status.state;
const gameDiv = document.querySelector('.gameContainer');
const status = document.querySelector('.status');
const count = document.querySelector('.mlbCount');
const baseballDiv = document.querySelector('.baseballInfoDiv');
const score = document.querySelector('.score');
const seriesRecord = document.querySelector('.seriesRecord');
const yardMarker = document.querySelector('.yardMarker');
const arrowImage = document.querySelector('.arrow_img');
const endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league.toLowerCase()}/scoreboard/${gameID}`;

//set displays for elements on initial load
baseballDiv.style.display = (league == "MLB" && game.situation !== undefined) ? 'flex' : 'none';
yardMarker.style.display = (league == "NFL" && game.situation !== undefined) ? 'flex' : 'none'; 
score.style.display = (game.status.state != "pre") ? 'flex' : 'none';
seriesRecord.style.display = (game.seasonType == 3 && game.status.state != "pre") ? 'flex' : 'none';
//determine image src and display for football possession arrow
arrowImage.style.display = (league == "NFL" && game.situation !== undefined) ? 'flex' : 'none';
if (league == "NFL" && game.situation !== undefined){
    arrowImage.src = (game.situation.possession == 
        game.awayTeam.id) ? "/images/left_arrow.png" : "/images/right_arrow.png";
}


async function updateEvent(gameDiv, endpoint, league){

    console.log("Getting data");

    const gameData = await (await fetch(endpoint)).json();

    const parsedGameData = parseGame(gameData);

    updateGameDiv(gameDiv, parsedGameData, league.toUpperCase());

}


let requests = setInterval(updateEvent, 10000, gameDiv, endpoint, league);
if (state == "post"){
    clearInterval(requests);
}
