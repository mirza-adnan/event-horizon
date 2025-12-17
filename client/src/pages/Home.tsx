import NavBar from "../components/HomeNavBar.tsx";
import HeroSection from "../components/HeroSection.tsx";
import HomeFooter from "../components/HomeFooter.tsx";

function Home() {
    return (
        <div>
            <NavBar />
            <div className="max-w-7xl mx-auto pt-5 px-6">
                <HeroSection />
                <HomeFooter />
            </div>
        </div>
    );
}

export default Home;
