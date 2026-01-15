interface Logo {
    href: string;
}

 export interface Team {
    abbreviation: string;
    displayName: string;
    logos: Logo[];
}

interface TeamWrapper {
    team: Team;
}

interface League {
    teams: TeamWrapper[];
}

interface Sport {
    leagues: League[];
}

export interface TeamResponse {
    sports: Sport[];
}