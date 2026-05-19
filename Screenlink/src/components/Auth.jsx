import { auth, provider } from "../firebase/config";
import { signInWithPopup, signOut } from "firebase/auth";
import { LogIn, LogOut, User } from "lucide-react";

const Auth = ({ user }) => {
  return (
    <div className="w-full">
      {user ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            {/* User info can be added here if needed */}
          </div>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 text-sm font-medium w-full sm:w-auto min-w-[100px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => signInWithPopup(auth, provider)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 sm:py-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg flex items-center justify-center space-x-2 sm:space-x-3 group"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <LogIn className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
          </div>
          <span className="text-base sm:text-lg whitespace-nowrap">Sign in with Google</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            →
          </div>
        </button>
      )}
    </div>
  );
};

export default Auth;