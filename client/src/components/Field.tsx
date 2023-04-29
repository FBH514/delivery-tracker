interface FieldProp {
    info?: string;
    value: string;
}

export default function Field(props: { params: FieldProp, className?: string }): JSX.Element {

    const classes = {
        fallback: "flex items-center md:flex-col justify-between gap-4 bg-black bg-opacity-20 py-2 px-4 rounded-md border border-1 border-black border-opacity-30 text-2xl w-10/12 md:w-full shadow-lg",
        defined: props.className
    }

    return (
        <div className={props.className ? classes.defined : classes.fallback}>
            <div className={"text-black font-bold md:text-center whitespace-nowrap"}>{props.params.info}</div>
            <div className={"text-black font-mono md:text-center"}>{props.params.value}</div>
        </div>
    )
}