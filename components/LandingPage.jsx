"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SparklesCore from "./Sparkels";

const LandingPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    const storedUseremail = sessionStorage.getItem("loggedinemail");
    if (storedUsername && storedUseremail) {
      setUsername(storedUsername);
      setUseremail(storedUseremail);
    }
  }, []);

  const handleGetStarted = () => {
    if (username && useremail) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-evenly bg-gradient-to-br from-blue-900 via-black to-gray-900 text-orange-500">
      {/* Sparkles Background */}
      <div className="absolute inset-0 pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.3}
          maxSize={0.9}
          particleDensity={15}
          className="w-full h-full opacity-20"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Hero Section */}
      <div className="text-center py-20 px-6 relative z-10">
        <h1 className="text-5xl font-bold">Welcome to SourceCorp CRM</h1>
        <p className="mt-4 text-lg text-orange-300">
          Empowering Financial Teams with Seamless CRM Solutions
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 pb-20 relative z-10">
        {[
          {
            title: "Customer Insights",
            description:
              "Gain real-time insights into customer behavior and improve engagement.",
          },
          {
            title: "Automated Workflows",
            description:
              "Boost productivity with smart automation for repetitive tasks.",
          },
          {
            title: "Secure & Scalable",
            description:
              "Built with security and scalability to support financial institutions.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-orange-300 text-black p-6 rounded-lg shadow-lg transition-transform duration-300 ease-in-out transform hover:-translate-y-3 hover:shadow-2xl"
          >
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="mt-2 text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Get Started Button */}
      <div className="flex justify-center items-start py-10 relative z-10">
        <button
          onClick={handleGetStarted}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg transition"
        >
          Get Started
        </button>
      </div>

      {/* Bottom Container with Coming Soon Banner */}
      <div className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white py-6 px-8 relative z-10 flex flex-col items-center shadow-lg rounded-2xl  animate-pulse">
        <h2 className="text-3xl font-extrabold tracking-wide mb-2">
          Leaderboard - Coming Soon!
        </h2>
        <p className="text-lg max-w-xl text-center opacity-90">
          Soon you’ll be able to see the top-performing financial teams and their
          scores here. Stay tuned for exciting updates!
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
