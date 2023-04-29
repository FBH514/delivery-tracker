import Field from "./Field.tsx";
import {DateProps} from "../App.tsx";

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

function loadingFallback(content: string): string {
    return "Loading " + content;
}

export default function Item(props: { params: TrackingProps | undefined, date: DateProps}) {

    const {tracking, detail, status, location, last_seen} = props.params ?? {};

    return (
        <div className="w-full flex flex-col gap-8 h-full items-center justify-center">
            <div className={"flex items-center justify-between w-10/12 md:w-full gap-4 md:flex-col md:gap-8"}>
                <Field params={{info: "Tracking Number", value: tracking ?? loadingFallback("Tracking")}}/>
                <Field params={{info: props.date.date, value: props.date.time}}/>
            </div>
            <Field params={{info: "Detail", value: detail ?? loadingFallback("Detail")}}/>
            <Field params={{info: "Status", value: status ?? loadingFallback("Status")}}/>
            <Field params={{info: "Location", value: location ?? loadingFallback("Location")}}/>
            <Field params={{info: "Last Seen On", value: last_seen ?? loadingFallback("Last Seen On")}}/>
        </div>
    );
}