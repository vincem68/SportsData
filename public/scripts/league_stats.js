const categorySelector = document.getElementById('categorySelect'); //category select
categorySelector.value = 0; //make the first option selected by default

const tableDivs = document.querySelectorAll('.tableDiv');
tableDivs.forEach(div => div.style.display = 'none');

const colHeaders = document.querySelectorAll('.statName');

const headliners = document.querySelectorAll('.importantHeadline');

//make stat selects and tables appear
function toggleTable(){
    const index = categorySelector.value;
    headliners.forEach(headline => headline.style.display = 'none');
    headliners[index].style.display = 'flex';
    tableDivs.forEach(table => table.style.display = 'none');
    tableDivs[index].style.display = 'block';
}

//sort table
function sortTable(colIndex){ //give column index of table for leagueStats lookup

    const catIndex = categorySelector.value; //value of selected category
    //color of sorted column
    const sortedColumnClass = (!colHeaders[colIndex].classList.contains("greatestSorted")) 
        ? "greatestSorted" : "leastSorted";

    console.log(sortedColumnClass);

    if (sortedColumnClass == "greatestSorted"){ //if true, sort from greatest, if false, sort from least
        leagueStats.categories[catIndex].teams.sort((team1, team2) => team2.statValues[colIndex] - team1.statValues[colIndex]);
    } else {
        leagueStats.categories[catIndex].teams.sort((team1, team2) => team1.statValues[colIndex] - team2.statValues[colIndex]);
    }

    //make sure the class is updated
    colHeaders.forEach(header => header.classList.remove("leastSorted", "greatestSorted"));
    colHeaders[colIndex].classList.add(sortedColumnClass);
    
    //replace each row except for the first one
    const table = document.querySelectorAll('table')[catIndex];
    table.replaceChildren(table.rows[0]);

    leagueStats.categories[catIndex].teams.forEach((team, index) => {
        const row = document.createElement('tr');
        const name = document.createElement('th');
        const rowNum = document.createElement('th');
        name.textContent = team.teamAbbr; //add in team name cell
        name.classList.add("name"); //add name class to team name elements
        rowNum.textContent = index + 1; //add in row number cell    
        row.append(rowNum);
        row.append(name);
        team.statValues.forEach((stat, index) => { //go through each stat and make the cell
            const cell = document.createElement('td');
            cell.classList.add("stat");
            cell.setAttribute('name', index); 
            cell.textContent = stat;
            row.append(cell);
        });
        table.append(row);
    });
    const statCells = document.querySelectorAll('.stat');
    statCells.forEach(cell => {
        if (Number(cell.getAttribute("name")) == colIndex){
            cell.classList.add(sortedColumnClass);
        } else {
            cell.classList.remove("leastSorted", "greatestSorted");
        }
    });
}

toggleTable();

categorySelector.addEventListener('change', toggleTable);