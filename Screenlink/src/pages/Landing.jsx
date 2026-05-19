import { Shield, Sparkles, ArrowRight } from "lucide-react";
import Auth from "../components/Auth";

function Landing({ user }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden px-4 sm:px-6 py-12 flex items-center justify-center relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background lights - wrapped in a container to prevent overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto relative z-10">
        {/* Banner Icon */}
        <div className="flex items-center justify-center mb-10">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Shield className="w-14 h-14 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl animate-ping opacity-20" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-6 text-center w-full">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight leading-tight">
            (ScreenLink)
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl text-gray-400 leading-relaxed max-w-4xl mx-auto">
            Create professional screen recordings and share them instantly with the world.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 w-full max-w-5xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium text-lg">High Quality Recording</p>
              <p className="text-gray-400 text-sm">Crystal clear video and audio capture</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium text-lg">Instant Sharing</p>
              <p className="text-gray-400 text-sm">Get shareable links immediately</p>
            </div>
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 mt-16 shadow-2xl max-w-xl w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
          <p className="text-gray-400 mb-6">
            Sign in to start recording your screen
          </p>
          <Auth user={user} />
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            Secure authentication • Privacy protected • Free to use • Devloped and managed By<span className="font-bold font-serif  tracking-wide"> Aryan Kumar</span>

          </p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
