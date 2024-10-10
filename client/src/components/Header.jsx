function Header({ logoUrl }) {
  return (
    <header className="p-4 bg-white shadow-md">
      <div className="flex justify-center">
        {/* Logo Section */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
          <img
            src={logoUrl}
            alt="Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
