import './main.css';
import Item, {TrackingProps} from "./components/Item.tsx";
import {FormEvent, useEffect, useMemo, useRef, useState} from "react";
import Socials from "./components/Socials.tsx";
import Button from "./components/Button.tsx";
import Input from "./components/Input.tsx";

export interface DateProps {
    date: string;
    time: string;
}

const headerClasses = {
    active: "w-10/12 h-50 md:h-full grid grid-cols-3 items-center justify-items-center gap-4 md:flex md:flex-col md:w-full",
    inactive: "w-10/12 h-50 grid grid-cols-1 items-center justify-items-center md:flex md:flex-col md:w-full gap-4"
}


const ICON_SIZE = 32;
enum iconColors {DARK = "000000", LIGHT = "ffffff"}

enum icons {
    CLOSE = `https://img.icons8.com/ios/${ICON_SIZE}/${iconColors.LIGHT}/delete-sign--v1.png`,
    EXPAND = `https://img.icons8.com/ios/${ICON_SIZE}/${iconColors.DARK}/expand-arrow--v2.png`
}

enum courriers {USPS = "usps"}
enum endpoints {
    POST_RUN_ENDPOINT = "http://localhost:8001/tracking/v1/run",
    GET_TRACKING_ENDPOINT = "http://localhost:8001/tracking/v1/data/usps/"
}

enum delays {
    TIME = 1000,
    REFETCH = 1000 * 60 // 1 minute
}

export default function App(): JSX.Element {

    const cached = window.localStorage.getItem("TRACKING_NUMBER");
    const [date, setDate] = useState<string>("🤔🧐");
    const [time, setTime] = useState<string>("What time is it?");
    const [showHeader, setShowHeader] = useState<boolean>(true);
    const [trackingNumber, setTrackingNumber] = useState<string>(cached ? JSON.parse(cached) : "Loading");
    const [trackingData, setTrackingData] = useState<TrackingProps>();
    const inputRef = useRef<HTMLInputElement>(null);

    useMemo(() => {
        const tracking_number = window.localStorage.getItem("TRACKING_NUMBER");
        if (tracking_number !== null) {
            setTrackingNumber(JSON.parse(tracking_number));
            POST(endpoints.POST_RUN_ENDPOINT, courriers.USPS, JSON.parse(tracking_number));
        }
        const banner = window.localStorage.getItem("BANNER");
        if (banner !== null) setShowHeader(JSON.parse(banner));
    }, []);

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

    // GET
    useEffect(() => {
        async function GET(endpoint: string): Promise<void> {
            const response = await fetch(endpoint);
            const data = await response.json();
            setTrackingData(data);
        }
        GET(`${endpoints.GET_TRACKING_ENDPOINT}${trackingNumber}`).then(r => console.log(r));
    }, [trackingNumber])

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
    }, delays.TIME);

    setInterval(async () => {
        await POST(endpoints.POST_RUN_ENDPOINT, courriers.USPS, trackingNumber);
    }, delays.REFETCH);

    function handleHideHeader(): void {
        window.localStorage.removeItem("BANNER");
        setShowHeader(!showHeader);
    }

    async function handleSubmit(e: FormEvent<HTMLButtonElement>): Promise<void> {
        e.preventDefault();
        const input = inputRef.current?.value;
        if (!input) {
            return;
        }
        setTrackingNumber(input);
        window.localStorage.setItem("TRACKING_NUMBER", JSON.stringify(input));
        await POST(endpoints.POST_RUN_ENDPOINT, courriers.USPS, input);
        setShowHeader(!showHeader);
    }

    return (
        <div
            className={"h-screen md:h-full sm:h-full p-20 md:p-10 grid grid-rows-2 items-center justify-items-center w-screen gap-8 bg-stone-300 relative"}
            style={{gridTemplateRows: "fit-content(100%) 1fr"}}
        >
            {showHeader ?
                (<div className={showHeader ? headerClasses.active : headerClasses.inactive}
                      style={showHeader ? {gridTemplateColumns: "4fr 2fr auto"} : {gridTemplateColumns: "1fr"}}>
                        <Input params={{placeholder: "Enter a tracking number", ref: inputRef}}/>
                        <Button params={{value: "Submit", onClick: handleSubmit}}/>
                        <Button params={{icon: icons.CLOSE, onClick: () => setShowHeader(!showHeader)}}/>
                    </div>
                ) : (
                    <div>
                        <Button params={{
                            icon: icons.EXPAND, onClick: handleHideHeader, iconStyles: showHeader ? "hidden" : "block"
                        }} className={
                            "py-2 px-4 bg-transparent w-auto hover:bg-black hover:bg-opacity-10 active:shadow-md rounded-md border border-1 border-black border-opacity-0 h-50"
                        }/>
                    </div>
                )}
            <Item params={trackingData} date={{date: date, time: time}}/>
            <Socials/>
        </div>
    );
}