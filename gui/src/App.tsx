import './css/reset.css';
import './css/Template.scss';
import './css/Track.scss';
import {QueryClient, QueryClientProvider} from "react-query";
import {ReactQueryDevtools} from "react-query/devtools";
import Track from "./components/Track";

const client = new QueryClient();

function App() {

    return (
        <QueryClientProvider client={client}>
            <Track/>
            {/*<ReactQueryDevtools initialIsOpen={false}/>*/}
        </QueryClientProvider>
    );
}

export default App;