import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classSectionImg from '../assets/ClassSection.jpg';
import classSection1Img from '../assets/ClassSection1.jpg';
import MRMoses from '../assets/MrMosesPIC.jpg';
import flyerImg from '../assets/flyer.jpg';
import GalleryVid from '../assets/galleryVid.mp4';
import legitImg from '../assets/legit.jpg';
import destiny from '../assets/destiny.jpg';
import mrlegit from '../assets/image.jpg'
import Elijah from '../assets/Elijah.jpg';
import gallery1 from '../assets/gallery1.jpg';
import gallery2 from '../assets/gallery2.jpg';
import gallery3 from '../assets/gallery3.jpg';
import gallery4 from '../assets/gallery4.jpg';
import gallery5 from '../assets/gallery5.jpg';
import gallery6 from '../assets/gallery6.jpg';
import gallery7 from '../assets/gallery7.jpg';
import gallery8 from '../assets/gallery8.jpg';
import gallery9 from '../assets/gallery9.jpg';
import gallery10 from '../assets/gallery10.jpg';

import tutorialVideo from '../assets/video_2026-07-20_20-16-29.mp4';
import secondVideo from '../assets/video_2026-07-20_20-16-42.mp4';

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9); // Shows 9 items initially
  const navigate = useNavigate();

  const galleryItems = [
    { title: "Tutorial Walkthrough", type: "video", src: GalleryVid, category: "Videos" },
    { title: "Classroom Session 2026", type: "image", src: classSectionImg, category: "Classroom" },
    { title: "Advanced Study Session", type: "image", src: classSection1Img, category: "Classroom" },
    { title: "Elijah (Merlin)", type: "image", src: Elijah, category: "Classroom" },
    { title: "Mr Moses (CEO OF LEGIT)", type: "image", src: MRMoses, category: "Management" },
    { title: "Destiny", type: "image", src: destiny, category: "Classroom" },
      { title: "Mr&Mrs Legit", type: "image", src: mrlegit, category: "Classroom" },
    { title: "Tutorial Walkthrough", type: "video", src: tutorialVideo, category: "Videos" },
    { title: "Center Activities 1", type: "image", src: gallery1, category: "Classroom" },
    { title: "Center Activities 2", type: "image", src: gallery2, category: "Classroom" },
    { title: "Center Activities 3", type: "image", src: gallery3, category: "Classroom" },
    { title: "Center Activities 4", type: "image", src: gallery4, category: "Classroom" },
    { title: "Center Activities 5", type: "image", src: gallery5, category: "Classroom" },
    { title: "Center Activities 6", type: "image", src: gallery6, category: "Classroom" },
    { title: "Center Activities 7", type: "image", src: gallery7, category: "Classroom" },
    { title: "Center Activities 8", type: "image", src: gallery8, category: "Classroom" },
    { title: "Center Activities 9", type: "image", src: gallery9, category: "Classroom" },
    { title: "Center Activities 10", type: "image", src: gallery10, category: "Classroom" },
    { title: "Center Activities Video", type: "video", src: secondVideo, category: "Videos" },
    { title: "Tutorial Event Flyer", type: "image", src: flyerImg, category: "Events" },
    { title: "Center Environment", type: "image", src: legitImg, category: "CBT" },
  ];

  // Slice the array so only a portion renders initially
  const displayedItems = galleryItems.slice(0, visibleCount);

  const loadMoreItems = () => {
    setVisibleCount(prev => prev + 6); // Load 6 more items on click
  };

  return (
    <div className="bg-black min-h-screen text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-yellow-500/20 pb-6">
          <div>
            <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">Visual Archive</span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mt-1">Complete Photo & Video Gallery</h1>
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedItems.map((item, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedItem(item)}
              className="relative group overflow-hidden rounded-xl border border-yellow-500/30 h-72 bg-neutral-900 shadow-lg flex flex-col justify-end cursor-pointer"
            >
              {item.type === "video" ? (
                <video 
                  src={item.src} 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <img 
                  src={item.src} 
                  alt={item.title} 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              )}

              <div className="relative z-10 bg-gradient-to-t from-black via-black/60 to-transparent p-6 pointer-events-none">
                <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1 block">{item.category}</span>
                <span className="text-white font-bold text-lg">{item.title}</span>
                <span className="text-xs text-gray-300 block mt-1">Click to expand 🔍</span>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < galleryItems.length && (
          <div className="text-center mt-12">
            <button 
              onClick={loadMoreItems}
              className="bg-neutral-900 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg text-sm sm:text-base"
            >
              Load More Photos ↓
            </button>
          </div>
        )}

      </div>

      {/* Lightbox Modal Popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-neutral-900 border border-yellow-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 bg-neutral-950/80 hover:bg-yellow-500 hover:text-black text-yellow-500 border border-yellow-500/40 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all shadow-lg"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="w-full max-h-[75vh] flex items-center justify-center bg-black overflow-hidden">
              {selectedItem.type === "video" ? (
                <video 
                  src={selectedItem.src} 
                  controls 
                  autoPlay
                  className="max-h-[75vh] w-auto object-contain"
                />
              ) : (
                <img 
                  src={selectedItem.src} 
                  alt={selectedItem.title} 
                  className="max-h-[75vh] w-auto object-contain"
                />
              )}
            </div>

            <div className="p-6 bg-neutral-950 border-t border-yellow-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">{selectedItem.category}</span>
                <h3 className="text-xl font-bold text-white">{selectedItem.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="bg-neutral-900 border border-yellow-500/30 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}