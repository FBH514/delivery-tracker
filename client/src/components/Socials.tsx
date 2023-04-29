interface SocialProps {
    name: string;
    link: string;
    icon: string;
}

function Social(props: { params: SocialProps }): JSX.Element {
    return (
        <div className={"hover:-translate-y-2"}>
            <a className={""} href={props.params.link} rel={"noreferrer"} target={"_blank"}>
                <img src={props.params.icon} alt={props.params.name}/>
            </a>
        </div>
    );
}

const ICON_SIZE = 48;
const ICON_COLOR = "000000";

const socials = {
    github: {
        name: "Github",
        link: "https://github.com/fbh514",
        icon: `https://img.icons8.com/glyph-neue/${ICON_SIZE}/${ICON_COLOR}/github.png`
    },
    linkedin: {
        name: "Github",
        link: "https://linkedin.com/in/fhandfield",
        icon: `https://img.icons8.com/glyph-neue/${ICON_SIZE}/${ICON_COLOR}/linkedin.png`
    },
    portfolio: {
        name: "Portfolio",
        link: "https://fbhworks.me",
        icon: `https://img.icons8.com/ios/${ICON_SIZE}/${ICON_COLOR}/source-code.png`
    }
}

export default function Socials(): JSX.Element {

    return (
        <div className={"flex items-center gap-4 absolute bottom-0 right-0 py-4 px-8 md:relative"}>
            <Social params={socials.portfolio}/>
            <Social params={socials.linkedin}/>
            <Social params={socials.github}/>
        </div>
    );
}