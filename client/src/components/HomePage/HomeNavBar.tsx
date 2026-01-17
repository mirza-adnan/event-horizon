import { Link } from "react-router-dom";
import LinkButton from "../LinkButton";

function NavLink({
    children,
    href,
}: {
    children: React.ReactNode;
    href: string;
}) {
    return (
        <li>
            <Link
                to={href}
                className="text-text-strong hover:cursor-pointer hover:underline  ease-in-out duration-50"
            >
                {children}
            </Link>
        </li>
    );
}

function NavBar() {
    const links = [
        {
            name: "About Us",
            link: "/about",
        },
        {
            name: "Explore",
            link: "/explore",
        },
        {
            name: "Features",
            link: "/features",
        },
        {
            name: "Contact Us",
            link: "/contact",
        },
    ];

    return (
        <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-accent">
            <div className="container px-24 mx-auto relative text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center flex-shrink-0">
                        <span className="text-2xl text-accent tracking-wide hover:cursor-pointer jaro">
                            Event <br />
                            Horizon{" "}
                        </span>
                    </div>
                    <ul className="hidden lg:flex ml-14 space-x-12">
                        {links.map((link) => (
                            <NavLink
                                key={link.link}
                                href={link.link}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </ul>
                    <div className="hidden lg:flex justify-center space-x-4 items-center">
                        <LinkButton
                            variant="primary"
                            path="/signup"
                        >
                            Sign Up
                        </LinkButton>
                        <LinkButton
                            variant="secondary"
                            path="/login"
                        >
                            Login
                        </LinkButton>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
