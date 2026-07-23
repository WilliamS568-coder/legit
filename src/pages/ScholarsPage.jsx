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
    ],
    "2025": [
      { name: "CHIBUIKE", score: "335", medal: "🥇", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400" },
      { name: "FATIMA", score: "315", medal: "🥈", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400" }
    ],
    "2024": [
      { name: "TUNDE", score: "320", medal: "🥇", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" },
      { name: "BLESSING", score: "310", medal: "🥈", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" }
    ]
  };

  return (
    <div className="bg-black min-h-screen text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-yellow-500/20 pb-6">
          <div>
            <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">Hall of Fame</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-1">All-Time Outstanding Scholars</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/')}
              className="bg-neutral-900 border border-yellow-500/40 text-yellow-500 px-5 py-2 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all text-sm whitespace-nowrap w-full sm:w-auto"
            >
              ← Back Home
            </button>
            <Link to="/contact" className="bg-neutral-900 border border-yellow-500/40 text-yellow-500 px-5 py-2 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all text-sm whitespace-nowrap w-full sm:w-auto text-center">
              Contact Us
            </Link>
          </div>
        </div>

        {Object.keys(allScholars).map((year) => (
          <div key={year} className="mb-16">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 border-l-4 border-yellow-500 pl-3">{year} Set Scholars</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {allScholars[year].map((scholar, index) => (
                <div key={index} className="bg-neutral-900 border border-yellow-500/30 p-6 rounded-2xl relative">
                  <div className="absolute top-4 right-4 text-2xl">{scholar.medal}</div>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-yellow-500 overflow-hidden bg-neutral-950">
                    <img src={scholar.img} alt={scholar.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-bold text-center">{scholar.name}</h3>
                  <p className="text-gray-400 text-xs text-center mb-3">JAMB Score</p>
                  <div className="text-2xl font-black text-center text-yellow-500 bg-yellow-500/10 py-2 rounded-lg border border-yellow-500/20">
                    {scholar.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}