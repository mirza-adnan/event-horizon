import LinkButton from "../components/LinkButton";
import NavBar from "../components/HomeNavBar.tsx";

function Home() {
    return (
        <div>
            <NavBar />
            <div className="flex flex-col items-center justify-start min-h-screen text-center p-4 mt-32">
                <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
                    Your Centralized Event Platform
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                    Discover, organize, and register for events, from institutional
                    gatherings to multi-segment conferences.
                </p>
                <div className="flex gap-4 justify-center items-center">
                    <LinkButton
                        variant="primary"
                        path="/signup"
                    >
                        Sign Up Today
                    </LinkButton>
                    <LinkButton
                        variant="tertiary"
                        path="organizers/registration"
                    >
                        Join as an Organizer
                    </LinkButton>
                </div>
            </div>
        </div>
    );
}

export default Home;
