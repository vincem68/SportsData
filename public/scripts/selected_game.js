//get the divs throughout the page
const statsDiv = document.getElementById('playerStats');
const homePlayerStatsDiv = document.getElementById('homeTeamPlayerStats');
const awayPlayerStatsDiv = document.getElementById('awayTeamPlayerStats');
const linescoreDiv = document.getElementById('linescoreDiv');
const leaderSection = document.getElementById('leaderSection');
const atBatSection = document.getElementById('atBat');
const footballSection = document.getElementById('footballInfo');
const awayTeamLeadersDiv = document.getElementById('awayTeamLeaders');
const homeTeamLeadersDiv = document.getElementById('homeTeamLeaders');
const linescoreHeaders = document.getElementById('linescoreHeaders');
const startingPitchersDiv = document.getElementById("startingPitchersDiv");

//specific stat keepers
const score = document.getElementById('score');
const gameStatus = document.getElementById('status');
const count = document.getElementById('count');
const outs = document.getElementById('outs');
const pitcherName = document.getElementById('pitcherName');
const batterName = document.getElementById('batterName');
const batterHeadshot = document.getElementById('batterHeadshot');
const pitcherHeadshot = document.getElementById('pitcherHeadshot');
const footballMarker = document.getElementById('footballMarker');
const awayTeamBoxscore = document.getElementById('awayTeamBoxscore');
const homeTeamBoxscore = document.getElementById('homeTeamBoxscore');
const footballPosArrow = document.getElementById('footballPossessionArrow');
const awayLinescoreRow = document.getElementById('awayTeamLinescoreRow');
const homeLinescoreRow = document.getElementById('homeTeamLinescoreRow');
const bases = document.getElementById('bases');
const gamePlay = document.getElementById('gameAction');

//the divs for the buttons of player scoresheets
const homeButton = document.getElementById("homeTeamButton");
const awayButton = document.getElementById("awayTeamButton");
const buttonSection = document.getElementById('buttonSection');

//on initial page load, hide the home team player section
homePlayerStatsDiv.style.display = "none";

//hide any stat divs if the game has not started yet
buttonSection.style.display = gameState == "pre" ? 'none' : 'flex';
linescoreDiv.style.display = gameState == "pre" ? 'none' : 'flex';
atBatSection.style.display = league == "MLB" && overview.situation ? 'flex' : 'none';
footballSection.style.display = league == "NFL" && gameState == "in" ? 'flex' : 'none';
leaderSection.style.display = gameState == "in" ? 'none' : 'flex';
gamePlay.style.display = gameState == "in" ? 'flex' : 'none';

document.getElementById('boxscore').style.display = league == "MLB" || awayTeamBoxscore.querySelectorAll('td').length == 0 ? 'none' : 'flex';

document.querySelectorAll('.leaderHeadline')[0].style.display = (awayTeamLeadersDiv.children.length > 0) ? 'block' : 'none';
document.querySelectorAll('.leaderHeadline')[1].style.display = (homeTeamLeadersDiv.children.length > 0) ? 'block' : 'none';


//put in football possession arrow if the game is active
if (league == "NFL" && gameState == "in"){ //set arrow to correct side
    footballPosArrow.src = (overview.situation.possession == overview.awayTeam.id) 
        ? '/images/left_arrow.png' : '/images/right_arrow.png';
    footballPosArrow.style.display = 'flex';
} else {
    footballPosArrow.style.display = 'none';
}

//hide any tables that have no players in it
document.querySelectorAll(".tableDiv").forEach(div => {
    if (div.querySelector("table").querySelectorAll("tr").length == 1){
        div.style.display = "none";
    }
})

//for the bases
if (league == "MLB" && (overview.status.shortDetail.includes("Top") || overview.status.shortDetail.includes("Bot"))){
    bases.style.display = 'flex';
    outs.style.display = 'flex';
    outs.src = overview.situation.outs == 0 ? "/images/out_0.png" 
            : overview.situation.outs == 1 ? "/images/out_1.png" : "/images/out_2.png";
    bases.src = getBasesCombo(overview.situation.onFirst, overview.situation.onSecond, overview.situation.onThird);
}


//when home team buttin div is clicked, hide away player stats and show home player ones
function toggleHomeStats(){
    awayPlayerStatsDiv.style.display = "none";
    homePlayerStatsDiv.style.display = "flex";
    statsDiv.style.backgroundColor = 'lightgreen';
}

//same as the previous function but in reverse
function toggleAwayStats(){
    homePlayerStatsDiv.style.display = "none";
    awayPlayerStatsDiv.style.display = "flex";
    statsDiv.style.backgroundColor = '#CCCC';
}

//set event listeners for the buttons
homeButton.addEventListener('click', toggleHomeStats);
awayButton.addEventListener('click', toggleAwayStats);



/**
 * Function to get the corresponding image for the bases socrebug
 * @param {*} first 
 * @param {*} second 
 * @param {*} third 
 * @returns 
 */
function getBasesCombo(first, second, third) {

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

/**
 * This function will be used when the game page is open before the game itself is active.
 * It will set up the needed divs, make things visible, and set up boxscores
 */
async function initializeStats() {

    //send the requests 
    const updateSummary = await parseSummary();
    const updateOverview = await parseOverview();

    if (updateSummary.gameState == "in"){ //when game starts, start setting everything up

        //remove any previous leaders if they are hidden
        awayTeamLeadersDiv.replaceChildren();
        homeTeamLeadersDiv.replaceChildren();

        //make player buttons, linescore and live imgae visible. Hide leaders div
        buttonSection.style.display = 'flex';
        leaderSection.style.display = 'none';
        linescoreDiv.style.display = 'flex';
        //change boxscore headline from season stats to Box Score
        document.getElementById('boxHeadline').textContent = "Box Score";
        //update the game status, and show the score as 0-0
        gameStatus.textContent = updateOverview.status.shortDetail;
        score.style.display = 'flex';
        score.textContent = "0 - 0";
        //if its a baseball game
        atBatSection.style.display = league == "MLB" ? 'flex' : 'none';
        bases.style.display = league == "MLB" ? 'flex' : 'none';
        bases.src = "/images/empty.png";
        outs.style.display = 'flex';
        outs.src = '/images/out_0.png';
        startingPitchersDiv.style.display = league == "MLB" ? 'flex' : 'none';
        //get yard marker and down
        footballSection.style.display = league == "NFL" ? 'flex' : 'none';
        gamePlay.style.display = 'flex';

        //reset the season stats of teams to 0 for the game specific stats
        if (league != "MLB"){
            //if its the first game of the season, and we don't have the season stats of the team
            if (awayTeamBoxscore.querySelectorAll('td').length == 0){
                const boxScoreHeadRow = document.getElementById('boxscore').querySelector('tr');
                updateSummary.awayTeamStats.forEach(stat => {
                    const header = document.createElement('th');
                    header.textContent = stat.label;
                    boxScoreHeadRow.appendChild(header);
                    const awayTD = document.createElement('td');
                    awayTeamBoxscore.appendChild(awayTD);
                    const homeTD = document.createElement('td');
                    homeTeamBoxscore.appendChild(homeTD);
                });
                boxscore.style.display = 'flex';
            }
            awayTeamBoxscore.querySelectorAll('td').forEach(cell => cell.textContent = '0');
            homeTeamBoxscore.querySelectorAll('td').forEach(cell => cell.textContent = '0');
        }

        //set first interval of linescore to 0
        awayLinescoreRow.querySelectorAll('td')[0].textContent = '0';
        homeLinescoreRow.querySelectorAll('td')[0].textContent = '0';

        if (league == "MLB"){
            document.querySelectorAll('.mlbLinescores').forEach(cell => cell.textContent = '0');
        }

        //create player boxscore
        createPlayerBoxscores(updateSummary.awayPlayerStats, awayPlayerStats, updateSummary.awayTeamAbbr);
        createPlayerBoxscores(updateSummary.homePlayerStats, homePlayerStats, updateSummary.homeTeamAbbr);

        //after we finish initialization, switch function to now get updates instead
        clearInterval(request);
        request = setInterval(updateGameStats, 10000);
    }
}

/**
 * helper function used in initializeStats() to set up the player boxscores
 * 
 * happens when the page is loaded pregame but the game starts while the page is open, creates the 
 * tables for the player stats for both teams
 * */
function createPlayerBoxscores(playerStats, divID){

    console.log("create player box scores");

    //go by category when making each table (like passing, rushing, batting, etc)
    playerStats.forEach(category => {
        //create the table for the player category (like rushing, passing, forwards, etc)
        const table = document.createElement('table');
        //create a headline for the category name if it exists in JSON
        const tableName = document.createElement('h2');
        tableName.textContent = category.categoryName;
        //create first row that contains the names of the stats in category
        const titleRow = document.createElement('tr');
        //for baseball games, add in a position column for the batter's position (DH, 1B, 2B, etc)
        if (league == "MLB" && category.categoryName == "BATTING"){
            const positionCol = document.createElement('td');
            positionCol.textContent = "Position";
            titleRow.appendChild(positionCol);
        }
        //add in player name column
        const playerNameHeader = document.createElement('td');
        playerNameHeader.textContent = "Player";
        titleRow.appendChild(playerNameHeader);
        //create the column names and give them the stat descriptions when hovered over
        category.catLabelsAndDescs.forEach(info => {
                const head = document.createElement('th');
                const div = document.createElement('div'); div.textContent = info.label;
                const span = document.createElement('span'); span.textContent = info.desc;
                span.classList.add('tooltip-text'); div.classList.add('tooltip');
                div.appendChild(span); head.appendChild(div); titleRow.appendChild(head);
        });
        table.appendChild(titleRow); //add row to table

        //this part will focus on making a row for each player in said table
        category.players.forEach(player => {
            //give each player row their API ID as the HTML ID for easier lookup
            const playerRow = document.createElement('tr');
            playerRow.classList.add(player.rowID);
            const playerName = document.createElement('td'); //put player name in front of row

            playerName.classList.add("name");

            //add in player name
            playerName.textContent = player.athleteName;
            playerRow.appendChild(playerName); //add name to row
            player.stats.forEach(stat => { //add stat value to corresponding row cells
                const statCell = document.createElement('td');
                statCell.textContent = stat;
                playerRow.appendChild(statCell);
            });
            table.appendChild(playerRow); //add the row to the table
        });
        divID.appendChild(table); //add the table to the div
        if (table.querySelectorAll("tr").length == 1){
            divID.style.display = 'none';
        }
    });
}


//this function will update all the stats within the page while the game is active
async function updateGameStats(){

    //basically use this as to know the requests are going
    console.log("Update");

    //send requests for updated data
    const updateSummary = await parseSummary();
    const updateOverview = await parseOverview();

    //update the status of the game
    gameStatus.textContent = updateOverview.status.shortDetail;
    //update the score
    score.textContent = updateOverview.awayTeam.score + " - " + updateOverview.homeTeam.score;
    
    if (updateOverview.situation){
        gamePlay.textContent = updateOverview.situation.play;
    }
    
    //if its a baseball game, update the strike and out count
    if (league == "MLB" && (updateOverview.status.shortDetail.includes("Top") || updateOverview.status.shortDetail.includes("Bot"))){
        bases.style.display = 'flex';
        outs.style.display = 'flex';
        count.textContent = updateOverview.situation.count;
        bases.src = getBasesCombo(updateOverview.situation.onFirst, updateOverview.situation.onSecond, updateOverview.situation.onThird);
        outs.src = updateOverview.situation.outs == 0 ? "/images/out_0.png" 
            : updateOverview.situation.outs == 1 ? "/images/out_1.png" : "/images/out_2.png";
    } else {
        bases.style.display = 'none';
        outs.style.display = 'none';
    }

    //update the at bat pitcher/batter if available, show name and headshot
    if (updateOverview.situation && updateOverview.situation.pitcher){
        atBatSection.style.display = 'flex';
        pitcherHeadshot.src = updateOverview.situation.pitcher.headshot;
        pitcherName.textContent = updateOverview.situation.pitcher.name;
        batterHeadshot.src = updateOverview.situation.batter.headshot;
        batterName.textContent = updateOverview.situation.batter.name;
    } else {
        atBatSection.style.display = 'none';
    }

    //update football marker if football game and the possession arrow image
    if (league == "NFL" && updateOverview.situation){
        //get the current down and yard line info and update the marker text
        footballMarker.textContent = updateOverview.situation.downDistanceText;
        //update the possession arrow based on who has possession
        footballPosArrow.src = (updateOverview.situation.possession == updateOverview.awayTeam.id) 
            ? '/images/left_arrow.png' : '/images/right_arrow.png';
    }

    //update the linescores
    //if the game is open and the game has to go to OT or extra innings. we need to add a new column
    if (updateOverview.linescore.currentAwayLinescoreInterval == document.querySelectorAll('.linescoreCell').length){
        const rowHeader = document.createElement('th'); //new row header for the new inning/OT column
        rowHeader.classList.add('linescoreInterval');
        //if NHL game goes to shootout, just label the new column SO 
        if (league == "NHL" && updateOverview.linescore.currentAwayLinescoreInterval == 4 && updateOverview.seasonType == 2){   
            rowHeader.textContent = "SO";
        } else if (league != "MLB"){ //if not a baseball game, have normal numbering for OT periods (OT, 2OT, 3OT, etc)
            rowHeader.textContent = (updateOverview.linescore.currentAwayLinescoreInterval - updateOverview.linescore.intervalLength + 1) + "OT";
        } else { //if MLB, just show the inning number for the header of the new inning column
            rowHeader.textContent = updateOverview.linescore.currentAwayLinescoreInterval;
        }
        //add in new cells for teams, with 0 as value
        const newAwayCell = document.createElement('td'); newAwayCell.textContent = '0'; newAwayCell.classList.add('linescoreCell');
        const newHomeCell = document.createElement('td'); newHomeCell.textContent = '0';

        if (document.getElementById('headerPoint') !== undefined){
            linescoreHeaders.insertBefore(rowHeader, document.getElementById('headerPoint'));
            awayLinescoreRow.insertBefore(newAwayCell, document.getElementById('awayPoint'));
            homeLinescoreRow.insertBefore(newHomeCell, document.getElementById('homePoint'));
        } else {
            linescoreHeaders.appendChild(rowHeader);
            awayLinescoreRow.appendChild(newAwayCell);
            homeLinescoreRow.appendChild(newHomeCell);
        }
        
    }
    awayLinescoreRow.querySelectorAll('td')[updateOverview.linescore.currentAwayLinescoreInterval].textContent = 
            updateOverview.linescore.currentAwayLinescoreValue;

    homeLinescoreRow.querySelectorAll('td')[updateOverview.linescore.currentHomeLinescoreInterval].textContent = 
            updateOverview.linescore.currentHomeLinescoreValue;
    
    //for baseball games, update the Runs, Hits and Errors counters
    if (league == "MLB"){
        const mlbLinescores = document.querySelectorAll('.mlbLinescores');
        mlbLinescores[0].textContent = updateOverview.linescore.awayRuns;
        mlbLinescores[1].textContent = updateOverview.linescore.awayHits;
        mlbLinescores[2].textContent = updateOverview.linescore.awayErrors;
        mlbLinescores[3].textContent = updateOverview.linescore.homeRuns;
        mlbLinescores[4].textContent = updateOverview.linescore.homeHits;
        mlbLinescores[5].textContent = updateOverview.linescore.homeErrors;
    }

    //update the overall boxscores if we have an NFL, NBA or NHL game
    if (league != "MLB"){
        const homeTeamStatsCells = homeTeamBoxscore.querySelectorAll('td');
        const awayTeamStatsCells = awayTeamBoxscore.querySelectorAll('td');
        homeTeamStatsCells.forEach((cell, index) => cell.textContent = updateSummary.homeTeamStats[index].value);
        awayTeamStatsCells.forEach((cell, index) => cell.textContent = updateSummary.awayTeamStats[index].value);
    }

    if (document.getElementById('awayColHeaders').children.length == 1){
        setUpPlayerStatsHeaders(updateSummary.awayPlayerStats.catLabelsAndDescs, "away");
        setUpPlayerStatsHeaders(updateSummary.awayPlayerStats.catLabelsAndDescs, "home");
    }

    //update player stats
    updatePlayerBoxscores(updateSummary.awayPlayerStats);
    updatePlayerBoxscores(updateSummary.homePlayerStats);

    //if game is final, stop sending requests and clear out live game status stuff
    if (updateOverview.status.state == "post"){
        //update the overall records of the teams when game ends
        document.querySelectorAll('.teamOverview')[0].querySelector('h3').textContent = 
            updateOverview.awayTeam.record;
        document.querySelectorAll('.teamOverview')[1].querySelector('h3').textContent = 
            updateOverview.homeTeam.record;

        //if its a playoff game, show the series status
        if (updateOverview.seasonType == 3 && league != "NFL"){
            document.getElementById('seriesStatus').style.display = 'flex';
            document.getElementById('seriesStatus').textContent = updateOverview.seriesSummary;
        }

        //hide these
        footballSection.style.display = 'none';
        atBatSection.style.display = 'none';
        gamePlay.style.display = 'none';

        //make the leader headlines visible again
        document.querySelectorAll('.leaderHeadline').forEach(headline => headline.style.display = 'flex');

        clearInterval(request); //clear the request

        if (league != "MLB"){ //if not a baseball game, create leaders board
            request = setInterval(() => {

                const leaders = parseLeaders();

                if (leaders.awayLeaders !== undefined){
                    deployLeadersDiv(awayTeamLeadersDiv, leaders.awayLeaders);
                    deployLeadersDiv(homeTeamLeadersDiv, leaders.homeLeaders);
                    leaderSection.style.display = 'flex';
                    clearInterval(request);
                }

            }, 10000);
        }

    }
}


/**
 * The goal of this function is to update the player box score tables. Upon every API call, the stats for each 
 * player will update, and will also add any new player that comes into the game and create a new row
 * @param {*} playersArray - 2D array of players from a single team containing their stats, got from API call
 */
function updatePlayerBoxscores(playersArray) {
    //go through every category/table
    playersArray.forEach(category => {
        //all the rows in the current table
        const tableRows = document.getElementById(category.tableID).querySelectorAll('tr');
        //go through the players array that represents each player/each row of the table/category 
        category.players.forEach(player => {
            //query select the player row of the table
            const playerRow = document.getElementById(category.tableID).querySelector('.' + player.rowID);

            if (playerRow){ //if the row exists
                
                const playerStatCells = playerRow.querySelectorAll('.stat'); //get all the stat cells of row
                //update each stat cell
                playerStatCells.forEach((cell, index) => cell.textContent = player.stats[index]);

            } else { //else, we need to add a new row to table if JSON update has new player

                const newRow = document.createElement('tr'); //create row
                newRow.classList.add(player.rowID); //set ID
                const playerName = document.createElement('td'); //create td for name
                //give bench/nonstarters visual difference
                playerName.classList.add("name");

                if (category.categoryName == "BATTING"){
                    const playerPos = document.createElement('td');
                    playerPos.textContent = player.starter ? "* - " + player.position : player.position;
                    newRow.appendChild(playerPos);
                }
                //player name
                playerName.textContent = player.athleteName;
                newRow.appendChild(playerName); //add name to row
                player.stats.forEach(stat => { //add new stat cells to row
                    const statTD = document.createElement('td'); 
                    statTD.textContent = stat;
                    statTD.classList.add("stat");
                    newRow.appendChild(statTD);
                });

                //if adding batter to baseball game, add that batter in order of lineup.
                const arrayIndex = category.players.indexOf(player);
                //if the game is baseball, and we're in the batters table, add in player in order of lineup
                if (category.categoryName == "BATTING" && arrayIndex != category.players.length - 1){
                    document.getElementById(category.tableID).insertBefore(newRow, tableRows[arrayIndex + 1]);                                   
                } else { //for other sports/cateogries just add player to end
                    document.getElementById(category.tableID).appendChild(newRow);
                }

                if (document.getElementById(category.tableID).length == 2){
                    document.getElementById(category.tableID).parentNode.style.display = 'flex';
                }
            }
        }) 
    })
}


/**
 * helper function used in at end of games to set up the leaders section
 * 
 * happens when the page is loaded before game ends but remains open,
 * creates the leaders for both teams
 * */
function deployLeadersDiv(leadersContainer, leaderArray){

    leaderArray.forEach(leader => {
        //create the div
        const leaderDiv = document.createElement('div');
        //create headline for leader's category
        const leaderHeadline = document.createElement('h3');
        leaderHeadline.textContent = leader.category;
        //create athlete image
        const headshot = document.createElement('img');
        headshot.src = leader.athleteHeadshot;
        headshot.classList.add('headshot');
        //create headline for athlete name
        const leaderName = document.createElement('h4');
        leaderName.textContent = leader.athleteName;
        leaderName.classList.add('leaderName');
        //add in a p element for the leader's value of the game
        const desc = document.createElement('p'); 
        desc.textContent = leader.value;
        desc.classList.add('leaderDesc');
        //append everything to the leaderDiv and add it to the leader section div
        leaderDiv.appendChild(leaderHeadline); leaderDiv.appendChild(headshot);
        leaderDiv.appendChild(leaderName); leaderDiv.appendChild(desc);
        leadersContainer.appendChild(leaderDiv);
    });
}

//if game hasn't started yet, set setInterval to initalizeStats to check for game start
//otherwise, set to updateGameStats if game is active/final
let request = (gameState == "pre") ? setInterval(initializeStats, 10000) : 
    ((gameState == "in") ? setInterval(updateGameStats, 7000) : null);




/**
 * Helper function for the overview JSON responses. This aims for more readable structure of the
 * response and therefore the code in the updating functions.
 */
async function parseOverview() {

    const response = await (await fetch(overviewEndpoint)).json();

    const competition = response.competitions[0];
    const awayCompetitor = competition.competitors[1];
    const homeCompetitor = competition.competitors[0];

    return {
        id: response.id,
        date: response.date,
        seasonType: response.season.type,

        awayTeam: {
            id: awayCompetitor.id,
            score: awayCompetitor.score,
            record: awayCompetitor.records[0].summary
        },

        homeTeam: {
            id: homeCompetitor.id,
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

            play: competition.situation ? competition.situation.lastPlay.type.text + ": " + competition.situation.lastPlay.text : "",
            
            downDistanceText: league == "NFL" ? competition.situation.downDistanceText : undefined,
            possession: league == "NFL" ? competition.situation.possession : undefined,
            count: competition.situation.batter ? competition.situation.balls + "-" + competition.situation.strikes : "--",
            outs: league == "MLB" && competition.situation ? competition.situation.outs : undefined,

            pitcher: league == "MLB" && competition.situation.pitcher ? {
                name: competition.situation.pitcher.athlete.shortName,
                id: competition.situation.pitcher.athlete.id,
                headshot: competition.situation.pitcher.athlete.headshot
            } : undefined,

            batter: league == "MLB" && competition.situation.batter ? {
                name: competition.situation.batter.athlete.shortName,
                headshot: competition.situation.batter.athlete.headshot
            } : undefined,

            onFirst: league == "MLB" ? competition.situation.onFirst : undefined,
            onSecond: league == "MLB" ? competition.situation.onSecond : undefined,
            onThird: league == "MLB" ? competition.situation.onThird : undefined

        } : undefined,

        seriesSummary: competition.series ? competition.series.summary : undefined,

        linescore: awayCompetitor.linescores ? {

            intervalLength: competition.format.regulation.periods,

            //just get the current linescore for both teams, and the runs, hits and errors if MLB
            currentAwayLinescoreInterval: competition.competitors[1].linescores.length - 1,
            currentHomeLinescoreInterval: competition.competitors[0].linescores.length - 1,
            currentAwayLinescoreValue: competition.competitors[1].linescores[competition.competitors[1].linescores.length - 1].displayValue,
            currentHomeLinescoreValue: competition.competitors[0].linescores[competition.competitors[0].linescores.length - 1].displayValue,
            awayRuns: league == "MLB" ? competition.competitors[1].statistics[1].displayValue : undefined,
            awayHits: league == "MLB" ? competition.competitors[1].statistics[0].displayValue : undefined,
            awayErrors: league == "MLB" ? competition.competitors[1].statistics[7].displayValue : undefined,
            homeRuns: league == "MLB" ? competition.competitors[0].statistics[1].displayValue : undefined,
            homeHits: league == "MLB" ? competition.competitors[0].statistics[0].displayValue : undefined,
            homeErrors: league == "MLB" ? competition.competitors[0].statistics[7].displayValue : undefined
        } : undefined
    }
}


async function parseSummary() {
    //get the JSON response
    const response = await (await fetch(summaryEndpoint)).json();

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
            response.boxscore.players[0].statistics[0].athletes.filter(athlete => athlete.didNotPlay == false);

        response.boxscore.players[1].statistics[0].athletes = 
            response.boxscore.players[1].statistics[0].athletes.filter(athlete => athlete.didNotPlay == false);
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
            label: stat.abbreviation ? stat.abbreviation : stat.label,
            value: stat.displayValue
        })),

        homeTeamStats: response.boxscore.teams[1].statistics.map(stat => ({
            //same as above comment
            label: stat.abbreviation ? stat.abbreviation : stat.label,
            value: stat.displayValue
        })),

        awayPlayerStats: response.boxscore.players ?
        
            response.boxscore.players[0].statistics.map(category => ({

                categoryName: league == "NBA" ? "OVERALL" 
                    : category.name ? category.name.split(/(?=[A-Z])/).map(word => word.toUpperCase()).join(" ") 
                    : category.type.toUpperCase(),

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
                        player.athlete.firstName[0] + ". " + player.athlete.lastName,
                    position: (league == "MLB") ? player.athlete.position.abbreviation : undefined,
                    starter: player.starter !== undefined ? player.starter : undefined,
                    batOrder: (league == "MLB") ? player.batOrder : undefined,
                    stats: player.stats
                }))
            })) : undefined,

        homePlayerStats: response.boxscore.players ?

            response.boxscore.players[1].statistics.map(category => ({

                categoryName: league == "NBA" ? "OVERALL" 
                : category.name ? category.name.split(/(?=[A-Z])/).map(word => word.toUpperCase()).join(" ") 
                : category.type.toUpperCase(),

                tableID: category.name ? response.boxscore.teams[1].team.abbreviation + category.name :
                    category.type ? response.boxscore.teams[1].team.abbreviation + category.type :
                    response.boxscore.teams[1].team.abbreviation + "overall",

                catLabelsAndDescs: category.labels.map((label, index) => ({
                    label: label,
                    desc: category.descriptions[index]
                })),

                players: category.athletes.map(player => ({
                    rowID: "athlete-" + player.athlete.id,
                    athleteName: player.athlete.shortName ? player.athlete.shortName : 
                        player.athlete.firstName[0] + ". " + player.athlete.lastName,
                    position: (league == "MLB") ? player.athlete.position.abbreviation : undefined,
                    starter: player.starter !== undefined ? player.starter : undefined,
                    batOrder: (league == "MLB") ? player.batOrder : undefined,
                    stats: player.stats
                }))
            })) : undefined
    }
}


//this function will parse the leader data from the JSON response when the game is over and the page is open during that
async function parseLeaders(){

    const response = await (await fetch(summaryEndpoint)).json();

    return {

        awayLeaders: response.leaders && response.meta.gameState != "in" ? response.leaders[0].leaders.map(leader => ({

            category: leader.displayName,
            athleteName: leader.leaders[0].athlete.shortName,

            //NFL response data will have a different JSON structure
            athleteHeadshot: (typeof leader.leaders[0].athlete.headshot === "string") ? 
                leader.leaders[0].athlete.headshot : leader.leaders[0].athlete.headshot.href ?? "",

            value: leader.leaders[0].displayValue

        })) : undefined,
            
        homeLeaders: response.leaders && response.meta.gameState != "in" ? response.leaders[1].leaders.map(leader => ({

            category: leader.displayName,
            athleteName: leader.leaders[0].athlete.shortName,

            athleteHeadshot: (typeof leader.leaders[0].athlete.headshot === "string") ?
                leader.leaders[0].athlete.headshot : leader.leaders[0].athlete.headshot.href ?? "",

            value: leader.leaders[0].displayValue

        })) : undefined
    }

}


//a little helper function that fixes a weird issue where table headers aren't showing after game start
function setUpPlayerStatsHeaders(labels, homeOrAway) {

    const colHeaders = document.getElementById(homeOrAway + "ColHeaders");

    if (colHeaders.children.length == 1){
        labels.forEach(labelInfo => {
            const header = document.createElement('th');
            const div = document.createElement('div');
            div.classList.add('tooltip');
            div.textContent = labelInfo.label;
            const span = document.createElement('span');
            span.classList.add('tooltip-text');
            span.textContent = labelInfo.desc;
            div.appendChild(span);
            header.appendChild(div);
            colHeaders.appendChild(header);
        });
    }

}