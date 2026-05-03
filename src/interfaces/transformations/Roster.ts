import type { RosterResponse, RosterData, Roster, NBA_Player } from "../types/Roster.types";


export async function parseRosterData(league: string, sport: string, team: string): Promise<RosterData>{

    const res: RosterResponse = await (
        await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/roster`)
    ).json();

    if (league !== "NBA"){ //filter out any groups that have no players 
        res.athletes = (res.athletes as Roster[]).filter(group => group.items.length > 0);
    }
        
    return {

        season: {
            year: res.season.year,
            type: res.season.type,
            name: res.season.displayName
        },

        coach: res.coach[0].firstName + " " + res.coach[0].lastName,

        team: {
            name: res.team.displayName,
            logo: res.team.logo,
            color: res.team.color,
            record: res.team.recordSummary,
            standings: res.team.standingSummary
        },

        groups: league !== "NBA" ? (res.athletes as Roster[]).map(position => {

            return {

                name: position.position.split(/(?=[A-Z])/).map(word => word.toUpperCase()).join(" "),

                athletes: position.items.map(athlete => {

                    return {
                        id: athlete.id,
                        fullName: athlete.fullName,
                        weight: athlete.displayWeight,
                        height: athlete.displayHeight,
                        age: athlete.age,
                        jersey: athlete.jersey,
                        position: {
                            name: athlete.position.displayName, 
                            abbr: athlete.position.abbreviation
                        },
                        yearsExperience: athlete.experience.years,
                        headshot: athlete.headshot ? athlete.headshot.href : "/images/default_headshot.png",
                        status: athlete.injuries.length > 0 ? athlete.injuries[0].status : athlete.status.name,
                        bats: league == "MLB" ? athlete.bats!.abbreviation : undefined,
                        throws: league == "MLB" ? athlete.throws!.abbreviation : undefined
                    }

                })
            }

        }) : [{ //we only have one group in basketball, just map the single athletes array
                name: "",

                athletes: (res.athletes as NBA_Player[]).map(athlete => {

                    return {

                        id: athlete.id,
                        fullName: athlete.fullName,
                        weight: athlete.displayWeight,
                        height: athlete.displayHeight,
                        age: athlete.age,
                        jersey: athlete.jersey,
                        position: {
                            name: athlete.position.displayName, 
                            abbr: athlete.position.abbreviation
                        },
                        yearsExperience: athlete.experience.years,
                        headshot: athlete.headshot ? athlete.headshot.href : "/images/default_headshot.png",
                        status: athlete.injuries.length > 0 ? athlete.injuries[0].status : athlete.status.name,
                    }
                })
            }]

    } as RosterData;
}