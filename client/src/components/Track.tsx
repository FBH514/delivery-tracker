import {useState} from "react";

export interface TrackingProps {
    tracking: string;
    content: string;
    status: string;
    detail: string;
    location: string;
    last_seen: string;
    date: string;
    usps_link: string;
}

function Track(props: {data: TrackingProps | undefined}): JSX.Element {

    const {data} = props
    const [date, setDate] = useState("🤔🧐");
    const [time, setTime] = useState("What time is it?");

    function getDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
        const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
        return {date: `${year}-${month}-${day}`, time: `${hours}:${minutes}:${seconds}`}
    }

    setInterval(() => {
        const updatedDate = getDate();
        setDate(updatedDate["date"]);
        setTime(updatedDate["time"]);
    }, 1000);

    function handleClick(): void {
      navigator.clipboard.writeText(data ? data["usps_link"] : "");
      const img = document.getElementById("copy") as HTMLImageElement;
      img.src = "https://img.icons8.com/material/32/fca311/checkmark--v1.png";
      img.classList.add("checkmark-active");
    };

    return (
        <div id="display-data">
            <div id="display-data-wrapper">
                <div id={"date"}>
                    <h3 id={"date-h3"}>{date}</h3>
                    <h3 id={"time-h3"}>{time}</h3>
                </div>
                <div className="data-field">
                    <h3>Last Status for Tracking Number <span id={"tracking"}>{data?.['tracking']}</span> → <span
                        id={"status"}>{data?.['status']}</span></h3>
                </div>
                <div className="data-field">
                    <h3><span id={"detail"}>{data?.['detail']}</span>: <span id={"location"}>{data?.['location']}</span>
                    </h3>
                </div>
                <div className="data-field">
                    <h3>Seen on <span id={"last-seen"}>{data?.['last_seen']}</span></h3>
                </div>
                <div id={"usps-link"}>
                    <h3>Tracking Link</h3>
                    <img
                      src="https://img.icons8.com/small/32/ffffff/copy.png"
                      alt={"click to copy"}
                      id={"copy"}
                      onClick={handleClick}
                    />
                </div>
            </div>
        </div>
    );
}

export default Track;