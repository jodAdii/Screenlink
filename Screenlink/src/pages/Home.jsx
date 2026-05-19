// pages/Home.jsx
import Auth from "../components/Auth";
import { Shield, Sparkles, ArrowRight } from "lucide-react";

function Home({ user }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      {/* ...Your landing UI from App.jsx */}
      <Auth user={user} />
    </div>
  );
}

export default Home;
