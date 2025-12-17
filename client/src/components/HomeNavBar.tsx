import LinkButton from "./LinkButton";

const NavBar = () => {
    return (
        <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-accent">
            <div className="container px-4 mx-auto relative text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center flex-shrink-0">
                        <span className="text-xl text-accent tracking-tight hover:cursor-pointer">Event Horizon</span>
                    </div>
                    <ul className="hidden lg:flex ml-14 space-x-12">
                        <li className="text-text-strong hover:cursor-pointer hover:border-b ease-in-out duration-50">About Us</li>
                        <li className="text-text-strong hover:cursor-pointer hover:border-b ease-in-out duration-50">Features</li>
                        <li className="text-text-strong hover:cursor-pointer hover:border-b ease-in-out duration-50">Contact Us</li>
                    </ul>
                    <div className="hidden lg:flex justify-center space-x-12 items-center">
                        <LinkButton
                            variant="secondary"
                            path="/signup"
                        >
                            Sign In
                        </LinkButton>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;