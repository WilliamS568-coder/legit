import { Link } from 'react-router-dom';
import destinyImg from '../assets/destiny.jpg';
import eniolaImg from '../assets/ENIOLA.jpg';
import elijahImg from '../assets/Elijah.jpg';

export default function SuccessStories() {
  const scholars = [
    { name: "DESTINY", score: "348", medal: "🥇", img: destinyImg },
    { name: "ENIOLA", score: "301", medal: "🥈", img: eniolaImg },
    { name: "ELIJAH", score: "301", medal: "🥉", img: elijahImg }
  ];

  return (
    <section className="py-20 bg-black text-white px-4 border-t border-yellow-500/20">
      <div className="max-w-6xl mx-auto text-center">
        <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">Outstanding Achievements</span>
        <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-12">2026 Outstanding Scholars</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {scholars.map((scholar, index) => (
            <div key={index} className="bg-neutral-900 border border-yellow-500/30 p-8 rounded-2xl relative overflow-hidden group shadow-xl">
              <div className="absolute top-4 right-4 text-3xl bg-neutral-950/80 p-2 rounded-xl border border-yellow-500/20 z-10">{scholar.medal}</div>
              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-500 to-amber-200 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-full h-full rounded-full border-2 border-yellow-500 overflow-hidden shadow-2xl bg-neutral-950 flex items-center justify-center">
                  <img src={scholar.img} alt={scholar.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold tracking-wider text-white mb-1">{scholar.name}</h3>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">JAMB Score</p>
              <div className="text-3xl font-black text-yellow-500 bg-yellow-500/10 py-3 rounded-xl border border-yellow-500/20 shadow-inner">{scholar.score}</div>
            </div>
          ))}
        </div>

        <Link to="/scholars" className="inline-block bg-neutral-900 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg">
          View All Scholars (2024 - 2026) →
        </Link>
      </div>
    </section>
  );
}