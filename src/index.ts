import express, {Request, Response} from 'express';
import path from 'path';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const port = 8000;

app.get('/games', async function(req: Request, res: Response) {

    const sport = req.query.sport;
    const league = req.query.league;
    const espn_response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`);
    const scores = await espn_response.json();
    res.render('games', { scores: scores });
})

app.get('/', (req: Request, res: Response) => {
    res.render('index', { port: port });
}) 

app.listen(port, () => {
    console.log("Started!");
});

