import { Link } from "react-router-dom";
import LinkButton from "../LinkButton";

function SimplifiedNavBar() {
    return (
        <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-zinc-800 bg-zinc-950/80">
            <div className="container px-6 lg:px-24 mx-auto relative text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center flex-shrink-0">
                        <Link to="/" className="text-2xl text-accent tracking-wide hover:cursor-pointer jaro leading-tight">
                            Event <br />
                            Horizon
                        </Link>
                    </div>
                    
                    <div className="flex justify-center space-x-4 items-center">
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

export default SimplifiedNavBar;
