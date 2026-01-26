import React from "react";
import HomePageRenderer from "../components/HomePageRenderer";
import homeJson from "../data/home.json";

function Home() {
  return <HomePageRenderer json={homeJson} />;
}

export default Home;
