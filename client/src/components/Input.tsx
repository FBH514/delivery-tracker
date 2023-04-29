import React from "react";

interface InputProps {
    placeholder: string;
    ref?: React.Ref<HTMLInputElement>;
}


export default function Input(props: {params: InputProps, className?: string}): JSX.Element {

    const classes = {
        fallback: "bg-black bg-opacity-20 py-2 px-4 rounded-md border border-1 border-black border-opacity-30 text-2xl w-full md:w-full shadow-lg placeholder:text-black md:placeholder:text-center",
        defined: props.className
    }

    return <input
        ref={props.params.ref}
        className={props.className ? classes.defined : classes.fallback}
        placeholder={props.params.placeholder}
        type="text"
    />
}