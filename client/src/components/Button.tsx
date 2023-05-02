import {FormEvent} from "react";

interface ButtonProps {
    value?: string;
    onClick?: (e: FormEvent<HTMLButtonElement>) => void;
    icon?: string;
    iconStyles?: string;
}

export default function Button(props: { params: ButtonProps, className?: string }): JSX.Element {

    const classes = {
        fallback: "py-2 px-4 bg-black rounded-md text-2xl text-white w-full active:bg-opacity-80 shadow-lg hover:bg-opacity-80 flex items-center justify-center border border-1 border-black h-50",
        defined: props.className
    }

    const iconStyles = {
        fallback: "rounded-md",
        defined: "rounded-md" + props.params.iconStyles
    }

    return <button type="submit" className={props.className ? classes.defined : classes.fallback}
                   onClick={props.params.onClick}
    >
        {props.params.value ? props.params.value : <img className={
            props.params.iconStyles ? iconStyles.defined : iconStyles.fallback
        } src={props.params.icon} alt={""}/>}
    </button>
}