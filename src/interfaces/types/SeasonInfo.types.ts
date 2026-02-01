
/**
 * This will be used to store season info for requests. 
 * 
 * - Year will be the season's current year. 
 * - Type will be the season type (1 = preseason, 2 = regular season, 3 = postseason, 4 = off-season).
 * 
 * This interface will mainly be used for getting necessary info from seasons to send to rendered views, and
 * to check to make sure the requested info from the user is valid.
 */
export interface SeasonInfo {
    year: number;
    type: number;
    code?: number;
}