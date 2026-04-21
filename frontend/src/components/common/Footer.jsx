export default function Footer() {
  return (
    <footer className="bg-black text-center py-6 text-sm text-white mt-auto">
      <p>© {new Date().getFullYear()} Printease. All rights reserved.</p>
      <div className="mt-2 text-gray-400">
        <p>Contact: <a href="mailto:layasadhana07@gmail.com" className="hover:text-white transition-colors">layasadhana07@gmail.com</a></p>
      </div>
      <p className="text-[#d4af37] mt-3">
        <a href="#" className="hover:underline hover:text-[#e6c200] transition-colors">Privacy Policy</a>
        {' '}|{' '}
        <a href="#" className="hover:underline hover:text-[#e6c200] transition-colors">Terms of Service</a>
      </p>
    </footer>
  );
}
