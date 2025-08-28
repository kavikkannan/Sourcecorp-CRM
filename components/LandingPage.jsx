"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SparklesCore from "./Sparkels"; // Assuming SparklesCore component is in the same directory
import BirthdayGreetingOverlay from "./BirthdayGreetingOverlay";
// Icon helper for SVG paths
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d={path} />
  </svg>
);

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

  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      title: "Unified Customer View",
      description: "Get a complete 360-degree view of your customers. Track every interaction, from initial contact to loan disbursement, all in one place.",
      details: ["Interaction History", "Document Tracking", "Key Financial Metrics"],
      iconPath: "M12,12A5,5 0 0,1 7,7A5,5 0 0,1 12,2A5,5 0 0,1 17,7A5,5 0 0,1 12,12M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
   /*  {
      title: "Automated Workflows & Tasks",
      description: "Eliminate manual data entry and repetitive tasks. Our smart workflows automatically assign tasks, send reminders, and update case statuses.",
      details: ["Automated Task Assignment", "Status-triggered Notifications", "Approval Process Automation"],
      iconPath: "M13,2.05V2.05C18.05,2.55 22,6.81 22,12C22,17.19 18.05,21.45 13,21.95V21.95A10,10 0 0,1 13,2.05M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z",
      image: "https://images.unsplash.com/photo-1587587833973-15c14114518d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    }, */
    {
      title: "Secure Document Management",
      description: "Upload, store, and share sensitive financial documents with confidence. Our system uses advanced encryption to protect your data.",
      details: ["Encrypted File Storage", "Version Control", "Secure Client Access Portals"],
      iconPath: "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,6.8L16,9V11C16,14.04 14.33,16.86 12,17.82C9.67,16.86 8,14.04 8,11V9L12,6.8Z",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    }
  ];

  const testimonials = [
    {
      quote: "SourceCorp CRM has transformed the way our team operates. The automated workflows save us hours every week, allowing us to focus on building client relationships.",
      name: "Priya Sharma",
      role: "Senior Financial Advisor",
    },
    {
      quote: "The unified customer view is a game-changer. Having all client data and documents in one place has made our loan processing incredibly efficient and error-free.",
      name: "Rajesh Kumar",
      role: "Loan Processing Manager",
    },
    {
      quote: "As a manager, the real-time notifications and team case views are invaluable. I can finally track my team's performance and ensure nothing falls through the cracks.",
      name: "Anita Desai",
      role: "Regional Sales Head",
    }
  ];

  const faqs = [
    {
        q: "Is my financial data secure?",
        a: "Absolutely. We use state-of-the-art, end-to-end encryption for all data, both in transit and at rest. Your security and privacy are our highest priority."
    },
    {
        q: "Can this CRM integrate with our existing software?",
        a: "Our platform is built with a flexible API, allowing for seamless integration with many popular financial software and tools. Contact our team for specific integration queries."
    },
    {
        q: "How does the pricing work?",
        a: "We offer flexible pricing plans based on the size of your team and the features you need. Please get in touch with our sales team for a custom quote."
    }
  ];


  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 text-gray-800 font-sans">
         <BirthdayGreetingOverlay isVisible1={true}/>
       {/* Sparkles Background - Added Back In */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <SparklesCore
                id="tsparticlesfullpage"
                background="transparent"
                minSize={0.8}
                maxSize={2.2}
                particleDensity={40}
                className="w-full h-full opacity-25"
                particleColor="#2563EB" // Changed to a theme-appropriate blue
            />
        </div>
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <img src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95" alt="SourceCorp Logo" className="h-16"/>
                <button onClick={handleGetStarted} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 text-sm font-semibold rounded-lg shadow-md transition-transform hover:scale-105">
                    {username ? "Go to Dashboard" : "Login"}
                </button>
            </div>
        </header>

        {/* All main content needs to be relatively positioned to sit on top of the sparkles */}
        <div className="relative z-10">
            <main>
                {/* Hero Section */}
                <section className="text-center py-24 px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500 leading-tight">
                        The Smart CRM for High-Performing Financial Teams
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        Streamline your operations, deepen client relationships, and close deals faster with a CRM built specifically for the demands of the financial industry.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <button onClick={handleGetStarted} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-transform hover:scale-105">
                            Get Started
                        </button>
                       {/*  <button className="bg-white hover:bg-gray-100 text-gray-700 px-8 py-3 text-lg font-semibold rounded-lg border border-gray-300 shadow-lg transition-transform hover:scale-105">
                            Book a Demo
                        </button> */}
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 bg-white/50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">How It Works</h2>
                            <p className="text-gray-600 mt-2">A simple, three-step process to elevate your workflow.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            <div className="flex flex-col items-center">
                                <div className="bg-orange-100 p-4 rounded-full"><Icon path="M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19M14.08,4.5L15.5,5.92L9.58,11.83L8.17,11.83L8.17,10.42L14.08,4.5M17.71,3.12L16.29,1.71C16.1,1.5 15.79,1.5 15.58,1.71L14.67,2.62L16.08,4.04L17,3.12C17.1,2.93 17.1,2.62 17,2.42M13.25,3.92L4,13.17V15.25H6.08L15.33,6L13.25,3.92Z" className="w-8 h-8 text-orange-600"/></div>
                                <h3 className="text-xl font-semibold mt-4">1. Create Case</h3>
                                <p className="text-gray-500 mt-2">Easily create and manage new client cases with all necessary details and documents in one secure place.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 p-4 rounded-full"><Icon path="M12,16L6,10H9V2H15V10H18L12,16M6,18H18V20H6V18Z" className="w-8 h-8 text-blue-600"/></div>
                                <h3 className="text-xl font-semibold mt-4">2. Collaborate & Track</h3>
                                <p className="text-gray-500 mt-2">Assign tasks, add notes, and track the status of each case in real-time with our collaborative timeline.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-green-100 p-4 rounded-full"><Icon path="M16,11.78L20.24,4.45L21.66,5.87L16.05,15.2L10.44,12.3L12.55,8.8L16,11.78M14,3C14.7,3 15.36,3.15 16,3.43V3C16,1.9 15.1,1 14,1H4C2.9,1 2,1.9 2,3V17C2,18.1 2.9,19 4,19H14C15.1,19 16,18.1 16,17V15.57C15.36,15.85 14.7,16 14,16C10.69,16 8,13.31 8,10C8,6.69 10.69,4 14,4C14,3.72 14,3.35 14,3Z" className="w-8 h-8 text-green-600"/></div>
                                <h3 className="text-xl font-semibold mt-4">3. Drive Growth</h3>
                                <p className="text-gray-500 mt-2">Analyze performance, identify bottlenecks, and make data-driven decisions to improve efficiency and grow your business.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6 space-y-24">
                        {features.map((feature, index) => (
                            <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                                <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                                    <div className="inline-flex items-center gap-3 bg-orange-100 text-orange-700 py-2 px-4 rounded-full mb-4">
                                        <Icon path={feature.iconPath} className="w-5 h-5"/>
                                        <h3 className="font-semibold">{feature.title}</h3>
                                    </div>
                                    <p className="text-lg text-gray-600">{feature.description}</p>
                                    <ul className="mt-4 space-y-2">
                                        {feature.details.map(detail => (
                                            <li key={detail} className="flex items-center gap-3">
                                                <Icon path="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" className="w-5 h-5 text-green-500"/>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className={index % 2 === 1 ? 'md:col-start-1' : ''}>
                                    <img src={feature.image} alt={feature.title} className="rounded-2xl shadow-2xl w-full h-full object-cover"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Testimonials */}
                {/* <section className="py-20 bg-blue-50/50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">Trusted by Financial Professionals</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border">
                                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                    <div className="mt-4 font-semibold">{testimonial.name}</div>
                                    <div className="text-orange-600 text-sm">{testimonial.role}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section> */}

                {/* FAQ */}
                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border rounded-lg">
                                    <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center p-4 text-left font-semibold">
                                        {faq.q}
                                        <span className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                                            <Icon path="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                        </span>
                                    </button>
                                    {openFaq === index && (
                                        <div className="p-4 pt-0 text-gray-600">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SourceCorp. All rights reserved.</p>
                        <div className="flex gap-4">
                           {/*  <a href="#" className="text-gray-500 hover:text-orange-500"><Icon path="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.28C8.28,9.09 5.11,7.38 2.9,4.79C2.53,5.42 2.33,6.16 2.33,6.94C2.33,8.43 3.1,9.75 4.18,10.55C3.46,10.53 2.78,10.32 2.17,10V10.08C2.17,12.21 3.66,14.03 5.79,14.44C5.45,14.53 5.08,14.57 4.7,14.57C4.42,14.57 4.15,14.54 3.89,14.5C4.46,16.29 6.1,17.58 8.06,17.62C6.56,18.81 4.73,19.53 2.75,19.53C2.4,19.53 2.04,19.51 1.69,19.46C3.68,20.74 5.94,21.5 8.36,21.5C16,21.5 20.25,14.92 20.25,9.2C20.25,9 20.25,8.8 20.24,8.61C21.08,8 21.83,7.07 22.46,6Z"/></a>
                            <a href="#" className="text-gray-500 hover:text-orange-500"><Icon path="M19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3M8.5,18H5.5V9H8.5V18M6.94,7.5C6.13,7.5 5.5,6.87 5.5,6.06C5.5,5.25 6.13,4.63 6.94,4.63C7.75,4.63 8.38,5.25 8.38,6.06C8.38,6.87 7.75,7.5 6.94,7.5M18.5,18H15.5V13.5C15.5,12.55 15.33,11.58 14.1,11.58C12.87,11.58 12.5,12.48 12.5,13.5V18H9.5V9H12.5V10.5H12.55C13.06,9.54 14.28,9 15.31,9C17.94,9 18.5,10.66 18.5,13V18Z"/></a>
                         */}
                         <p className="text-sm text-gray-500">sourcecorp.solution@gmail.com</p>

                         </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default LandingPage;