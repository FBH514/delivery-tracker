import './css/reset.css';
import './css/Template.scss';
import './css/Track.scss';
import {QueryClient, QueryClientProvider} from "react-query";
import Track from "./components/Track";

const client = new QueryClient();

function App() {

    return (
        <QueryClientProvider client={client}>
            <Track/>
        </QueryClientProvider>
    );
}

export default App;