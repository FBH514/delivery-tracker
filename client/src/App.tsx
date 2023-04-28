import './css/reset.css';
import './css/Template.scss';
import './css/Track.scss';
import {useQuery} from "react-query";
import Track, {TrackingProps} from "./components/Track";

const TRACKING_ENDPOINT = "http://localhost:8001/tracking/v1/data"
const TRACKING_QUERY_KEY = "TRACKING";

function App(): JSX.Element {

    async function GET(endpoint: string): Promise<TrackingProps> {
        const response = await fetch(endpoint);
        return await response.json();
    }

    const {data} = useQuery<TrackingProps>(TRACKING_QUERY_KEY, () => GET(TRACKING_ENDPOINT));

    return <Track data={data}/>
}

export default App;