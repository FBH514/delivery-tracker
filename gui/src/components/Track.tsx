import {useQuery} from "react-query";
import {useState} from "react";

function Track() {

    const endpoint = "http://localhost:8000/usps-tracking/v1/data"

    async function FetchData() {
        const response = await fetch(endpoint);
        return await response.json();
    }

    const [date, setDate] = useState("");
    const {isLoading, data} = useQuery('data', FetchData);

    if (isLoading) {
        return (
            <div id="display-data">
                <div id="display-data-wrapper">
                    <div id="data-field">
                        <h3>Loading</h3>
                    </div>
                </div>
            </div>
        );
    }

    function GetDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
        const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    setInterval(() => {
        const updatedDate = GetDate();
        setDate(updatedDate)
    }, 1000);

    return (
        <div id="display-data">
            <div id="display-data-wrapper">
                <div id={"date"}>
                    <h3>{date}</h3>
                </div>
                <div className="data-field">
                    <h3>Last Status for Tracking Number <span id={"tracking"}>{data['tracking']}</span> → <span
                        id={"status"}>{data['status']}</span></h3>
                </div>
                <div className="data-field">
                    <h3><span id={"detail"}>{data['detail']}</span>: <span id={"location"}>{data['location']}</span>
                    </h3>
                </div>
                <div className="data-field">
                    <h3>Last Seen on <span id={"last-seen"}>{data['last_seen']}</span></h3>
                </div>
            </div>
        </div>
    );
}

export default Track;