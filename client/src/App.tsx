import './main.css';
import Item, {TrackingProps} from "./components/Item.tsx";
import {useQuery} from "react-query";
import {useEffect, useMemo, useRef, useState} from "react";
import Socials from "./components/Socials.tsx";
import Button from "./components/Button.tsx";
import Input from "./components/Input.tsx";

export interface DateProps {
    date: string;
    time: string;
}

const headerClasses = {
    active: "w-10/12 h-full grid grid-cols-2 items-center justify-items-center gap-4 md:flex md:flex-col md:w-full",
    inactive: "w-10/12 h-full flex items-center justify-items-center"
}

const ICON_SIZE = 32;
enum iconColors {
    DARK = "000000",
    LIGHT = "ffffff"
}

enum icons {
    CLOSE = `https://img.icons8.com/ios/${ICON_SIZE}/${iconColors.LIGHT}/delete-sign--v1.png`,
    EXPAND = `https://img.icons8.com/ios/${ICON_SIZE}/${iconColors.DARK}/expand-arrow--v2.png`
}

enum endpoints {
    POST_RUN_ENDPOINT = "http://localhost:8001/tracking/v1/run",
    GET_TRACKING_ENDPOINT = "http://localhost:8001/tracking/v1/data/usps/"
}

enum supportedCouriers {
    USPS = "USPS"
}

const GET_TRACKING_QUERY_KEY = "TRACKING";
const CACHE = {cacheTime: 0, staleTime: 0, refetchOnWindowFocus: false}

export default function App(): JSX.Element {

    const cached = window.localStorage.getItem("TRACKING_NUMBER");
    const [date, setDate] = useState<string>("🤔🧐");
    const [time, setTime] = useState<string>("What time is it?");
    const [showHeader, setShowHeader] = useState<boolean>(true);
    const [trackingNumber, setTrackingNumber] = useState<string>(cached ? JSON.parse(cached) : "Loading");
    const inputRef = useRef<HTMLInputElement>(null);

    useMemo(async () => {
        const tracking_number = window.localStorage.getItem("TRACKING_NUMBER");
        if (tracking_number !== null) {
            setTrackingNumber(JSON.parse(tracking_number));
        }
        const banner = window.localStorage.getItem("BANNER");
        if (banner !== null) setShowHeader(JSON.parse(banner));
    }, [])

    useMemo(() => {
        window.localStorage.setItem("BANNER", JSON.stringify(showHeader));
    }, [showHeader])

    useEffect(() => {
        function handler(event: KeyboardEvent): void {
            if (event.key === "Enter" && showHeader) {
                handleHideHeader();
            }
            if (event.key === "Escape") {
                handleHideHeader();
            }
        }

        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler)
    })

    useEffect(() => {
        if (inputRef.current && showHeader) {
            inputRef.current.focus();
        }
    })

    async function GET(endpoint: string): Promise<TrackingProps | undefined> {
        const response = await fetch(endpoint);
        return await response.json();
    }

    async function POST(endpoint: string, deliveryService: string, trackingNumber: string): Promise<any> {
        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                deliveryService: deliveryService,
                trackingNumber: trackingNumber
            })
        }).then(response => {
            if (response.ok) return response.json()
        }).catch(error => console.log(error))
    }

    const {data} = useQuery<TrackingProps | undefined>(GET_TRACKING_QUERY_KEY, () => GET(`${endpoints.GET_TRACKING_ENDPOINT}${trackingNumber}`), CACHE);

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

    async function handleSubmit(): Promise<void> {
        const input = inputRef.current?.value;
        if (!input) return;
        setTrackingNumber(input);
        window.localStorage.setItem("TRACKING_NUMBER", JSON.stringify(input));
        setShowHeader(!showHeader);
    }

    return (
        <div
            className={"h-screen md:h-full sm:h-full p-20 md:p-10 grid grid-rows-2 items-center justify-items-center w-screen gap-8 bg-stone-300 relative"}
            style={{gridTemplateRows: "fit-content(100%) 1fr"}}
        >
            {showHeader ?
                (<div className={showHeader ? headerClasses.active : headerClasses.inactive}
                      style={{gridTemplateColumns: "4fr 2fr auto"}}>
                        <Input params={{placeholder: "Enter a tracking number", ref: inputRef}}/>
                        <Button params={{value: "Submit", onClick: handleSubmit}}/>
                        <Button params={{icon: icons.CLOSE, onClick: () => setShowHeader(!showHeader)}}/>
                    </div>
                ) : (
                    <div>
                        <Button params={{icon: icons.EXPAND, onClick: handleHideHeader}} className={
                            "py-2 px-4 bg-transparent w-auto hover:bg-black hover:bg-opacity-10 active:shadow-md rounded-md"
                        }/>
                    </div>
                )}
            <Item params={data} date={{date: date, time: time}}/>
            <Socials/>
        </div>
    );
}