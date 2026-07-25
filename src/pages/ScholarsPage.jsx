import { Link } from 'react-router-dom';
import destinyImg from '../assets/destiny.jpg';
import eniolaImg from '../assets/ENIOLA.jpg';
import elijahImg from '../assets/Elijah.jpg';
import { useNavigate } from 'react-router-dom';

export default function ScholarsPage() {
  const navigate = useNavigate();
  const allScholars = {
    "2026": [
      { name: "DESTINY", score: "348", medal: "🥇", img: destinyImg },
      { name: "ENIOLA", score: "301", medal: "🥈", img: eniolaImg },
      { name: "ELIJAH", score: "301", medal: "🥉", img: elijahImg }
    ]
  };

  return (
    <div className="bg-black min-h-screen text-white py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-8 sm:mb-12 border-b border-yellow-500/20 pb-6">
          <div>
            <span className="text-yellow-500 uppercase tracking-widest text-xs sm:text-sm font-semibold">Hall of Fame</span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mt-1 sm:mt-2">All-Time Outstanding Scholars</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/')}
              className="bg-neutral-900 border border-yellow-500/40 text-yellow-500 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto"
            >
              ← Back Home
            </button>
            <Link to="/contact" className="bg-neutral-900 border border-yellow-500/40 text-yellow-500 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto text-center">
              Contact Us
            </Link>
          </div>
        </div>

        {Object.keys(allScholars).map((year) => (
          <div key={year} className="mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-500 mb-4 sm:mb-6 border-l-4 border-yellow-500 pl-3 sm:pl-4">{year} Set Scholars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {allScholars[year].map((scholar, index) => (
                <div key={index} className="bg-neutral-900 border border-yellow-500/30 p-4 sm:p-6 rounded-2xl relative">
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-xl sm:text-2xl">{scholar.medal}</div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full border-2 border-yellow-500 overflow-hidden bg-neutral-950">
                    <img src={scholar.img} alt={scholar.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-center">{scholar.name}</h3>
                  <p className="text-gray-400 text-[10px] sm:text-xs text-center mb-2 sm:mb-3">JAMB Score</p>
                  <div className="text-xl sm:text-2xl font-black text-center text-yellow-500 bg-yellow-500/10 py-2 sm:py-2.5 rounded-lg border border-yellow-500/20">
                    {scholar.score}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-xs sm:text-sm mt-4 sm:mt-6 italic">and many more...</p>
          </div>
        ))}
      </div>
    </div>
  );
}