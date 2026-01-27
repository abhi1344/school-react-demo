import React, { useEffect, useState } from "react";
import HomePageRenderer from "../components/HomePageRenderer";

function Home() {
  const [homeJson, setHomeJson] = useState(null);

  useEffect(() => {
    // Fetch JSON from public folder
    fetch("/json/home.json")
      .then((res) => res.json())
      .then((data) => setHomeJson(data))
      .catch((err) => console.error("Failed to load home.json", err));
  }, []);

  if (!homeJson) return <p>Loading...</p>;

  return <HomePageRenderer json={homeJson} />;
}

export default Home;
