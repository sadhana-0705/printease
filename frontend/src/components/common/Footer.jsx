export default function Footer() {
  return (
    <footer className="bg-black text-center py-4 text-sm text-white mt-auto">
      <p>© {new Date().getFullYear()} Printease. All rights reserved.</p>
      <p className="text-[#d4af37] mt-1">
        <a href="#" className="hover:underline hover:text-[#e6c200] transition-colors">Privacy Policy</a>
        {' '}|{' '}
        <a href="#" className="hover:underline hover:text-[#e6c200] transition-colors">Terms of Service</a>
      </p>
    </footer>
  );
}
