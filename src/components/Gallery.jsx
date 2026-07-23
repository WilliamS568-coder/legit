import { Link } from 'react-router-dom';
import classSectionImg from '../assets/ClassSection.jpg';
import gallery4 from '../assets/gallery4.jpg';
import gallery3 from '../assets/gallery3.jpg';
import gallery5 from '../assets/gallery5.jpg';
export default function Gallery() {
  const galleryItems = [
    { title: "Classroom Sessions", img: classSectionImg },
    { title: "CBT Practice", img: gallery3 },
    { title: "Graduation Celebration", img: gallery4 },
    { title: "Tutorial Environment", img:  gallery5 }
  ];

  return (
    <section id="gallery" className="py-20 bg-black text-white px-4 border-t border-yellow-500/20">
      <div className="max-w-6xl mx-auto text-center">
        <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">Our Environment</span>
        <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-12">Photo Gallery</h2>

        {/* Responsive Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {galleryItems.map((item, index) => (
            <div key={index} className="relative group overflow-hidden rounded-xl border border-yellow-500/30 h-64 bg-neutral-900 shadow-lg">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-4">
                <span className="text-white font-bold text-sm tracking-wide">{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        <Link to="/gallery" className="inline-block bg-neutral-900 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg text-sm sm:text-base">
          View Complete Gallery →
        </Link>
      </div>
    </section>
  );
}