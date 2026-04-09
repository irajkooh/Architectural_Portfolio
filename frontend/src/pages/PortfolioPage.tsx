import Nav from "../components/Nav";
import GlobalBackground from "../components/GlobalBackground";
import HeroSection from "../sections/HeroSection";
import AboutSection from "../sections/AboutSection";
import PortfolioSection from "../sections/PortfolioSection";
import ResumeSection from "../sections/ResumeSection";
import ContactSection from "../sections/ContactSection";
import ShowcaseSection from "../sections/ShowcaseSection";
import ChatSection from "../sections/ChatSection";

export default function PortfolioPage() {
  return (
    <>
      <GlobalBackground />
      <Nav />
      <main>
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <ResumeSection />
        <ContactSection />
        <ShowcaseSection />
        <ChatSection />
      </main>
      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          fontSize: "0.8rem",
          opacity: 0.3,
          borderTop: "1px solid var(--border)",
        }}
      >
        © {new Date().getFullYear()} Tella Irani Shemirani. All rights reserved.
      </footer>
    </>
  );
}
