export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-8 text-gray-400 mt-auto w-full z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary tracking-wider">
              MOVIE<span className="text-white">MATE</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Careers</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
          
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MovieMate. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
