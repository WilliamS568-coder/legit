export default function Testimonials() {
  const reviews = [
    { text: "LEGIT TUTORS transformed my JAMB preparation. I scored above 300.", author: "Previous Student" },
    { text: "Excellent tutors and CBT practice. Highly recommended.", author: "Parent" },
    { text: "They guided me from registration to admission.", author: "University Undergraduate" }
  ];

  return (
    <section className="py-20 bg-neutral-950 text-white px-4 border-t border-yellow-500/20">
      <div className="max-w-6xl mx-auto text-center">
        <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">Testimonials</span>
        <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-12">What Our Students Say</h2>

        {/* Overall Rating Summary Card */}
        <div className="bg-neutral-900 border border-yellow-500/20 rounded-2xl p-8 mb-12 shadow-xl flex flex-col md:flex-row items-center justify-center gap-8 max-w-3xl mx-auto">
          
          {/* Left Side: Score */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left md:border-r border-yellow-500/20 md:pr-12">
            <span className="text-gray-400 text-sm font-semibold mb-1">Overall Ratings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-white">4.6</span>
              <span className="text-2xl text-gray-400 font-bold">/5</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Based on 54 reviews</p>
            <div className="flex text-yellow-500 text-xl mt-3">
              ★★★★★
            </div>
          </div>

          {/* Right Side: Rating Breakdown Bars */}
          <div className="w-full max-w-sm flex flex-col gap-2">
            
            {/* 5 Star */}
            <div className="flex items-center gap-3 text-sm">
              <span className="w-12 text-gray-300 font-medium">5 star</span>
              <div className="flex-1 bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-yellow-500/10">
                <div className="bg-yellow-500 h-full w-[66%] rounded-full"></div>
              </div>
              <span className="w-8 text-right text-gray-400">105</span>
            </div>

            {/* 4 Star */}
            <div className="flex items-center gap-3 text-sm">
              <span className="w-12 text-gray-300 font-medium">4 star</span>
              <div className="flex-1 bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-yellow-500/10">
                <div className="bg-yellow-500 h-full w-[32%] rounded-full"></div>
              </div>
              <span className="w-8 text-right text-gray-400">50</span>
            </div>

            {/* 3 Star */}
            <div className="flex items-center gap-3 text-sm">
              <span className="w-12 text-gray-300 font-medium">3 star</span>
              <div className="flex-1 bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-yellow-500/10">
                <div className="bg-yellow-500 h-full w-[2%] rounded-full"></div>
              </div>
              <span className="w-8 text-right text-gray-400">2</span>
            </div>

            {/* 2 Star */}
            <div className="flex items-center gap-3 text-sm">
              <span className="w-12 text-gray-300 font-medium">2 star</span>
              <div className="flex-1 bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-yellow-500/10">
                <div className="bg-yellow-500 h-full w-0"></div>
              </div>
              <span className="w-8 text-right text-gray-400">0</span>
            </div>

            {/* 1 Star */}
            <div className="flex items-center gap-3 text-sm">
              <span className="w-12 text-gray-300 font-medium">1 star</span>
              <div className="flex-1 bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-yellow-500/10">
                <div className="bg-yellow-500 h-full w-0"></div>
              </div>
              <span className="w-8 text-right text-gray-400">0</span>
            </div>

          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-neutral-900 border border-yellow-500/20 p-8 rounded-2xl flex flex-col justify-between text-left">
              <div>
                <div className="text-yellow-500 text-xl mb-4">★★★★★</div>
                <p className="text-gray-300 italic mb-6">"{review.text}"</p>
              </div>
              <p className="text-yellow-500 font-semibold text-sm">— {review.author}</p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}