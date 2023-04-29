import './main.css';
import Item, {TrackingProps} from "./components/Item.tsx";
import {useQuery} from "react-query";
import {useEffect, useMemo, useState} from "react";
import Socials from "./components/Socials.tsx";

export interface DateProps {
    date: string;
    time: string;
}

const TRACKING_ENDPOINT = "http://localhost:8001/tracking/v1/data";
const TRACKING_QUERY_KEY = "TRACKING";

export default function App(): JSX.Element {

    async function GET(endpoint: string): Promise<TrackingProps> {
        const response = await fetch(endpoint);
        return await response.json();
    }

    const [date, setDate] = useState<string>("🤔🧐");
    const [time, setTime] = useState<string>("What time is it?");
    const [showHeader, setShowHeader] = useState<boolean>(true);
    const {data} = useQuery<TrackingProps>(TRACKING_QUERY_KEY, () => GET(TRACKING_ENDPOINT));

    useMemo(() => {
        const stored = window.localStorage.getItem("BANNER");
        if (stored !== null) setShowHeader(JSON.parse(stored));
    }, [])

    useMemo(() => {
        window.localStorage.setItem("BANNER", JSON.stringify(showHeader));
    }, [showHeader])

    useEffect(() => {
        function handler(event: KeyboardEvent): void {
            if (event.key === "Enter" && showHeader) {
                handleHideHeader();
            }
        }

        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler)
    })

    function getDate(): DateProps {
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

    function handleHideHeader(): void {
        window.localStorage.removeItem("BANNER");
        setShowHeader(!showHeader);
    }

    return (
        <div className={"h-screen md:h-full sm:h-full p-20 md:p-10 flex items-center md:flex-col justify-center w-screen gap-8 bg-stone-300 relative"}>
            <Item params={data} date={{date: date, time: time}}/>
            <Socials/>
        </div>
    );
}