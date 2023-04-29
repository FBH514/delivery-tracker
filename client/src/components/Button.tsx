interface ButtonProps {
    value?: string;
    icon?: string;
    onClick?: () => void;
}

export default function Button(props: { params: ButtonProps, className?: string }): JSX.Element {

    const classes = {
        fallback: "py-2 px-4 bg-black rounded-md text-2xl text-white w-full active:bg-opacity-80 shadow-lg hover:bg-opacity-80 flex items-center justify-center",
        defined: props.className
    }

    return <button type="submit" className={props.className ? classes.defined : classes.fallback}
                   onClick={props.params.onClick}
    >
        {props.params.value ? props.params.value : <img className={"rounded-md"} src={props.params.icon} alt={""}/>}
    </button>
}