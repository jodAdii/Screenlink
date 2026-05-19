// components/ProtectedLayout.jsx
function ProtectedLayout({ user, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur">
        <h2 className="text-xl font-semibold">Welcome, {user.displayName || "User"}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default ProtectedLayout;
