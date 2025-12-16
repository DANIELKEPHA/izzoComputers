import React from "react";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import DiscoverSection from "./DiscoverSection";
import CallToActionSection from "./CallToActionSection";
import FooterSection from "./FooterSection";
import ShopPage from "@/app/(nondashboard)/landing/shop/page";

const Landing = () => {
  return (
    <div>
      <ShopPage />
      <FeaturesSection />
      <DiscoverSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  );
};

export default Landing;
