export default function AboutUs() {
  const features = [
    {
      title: "Qualified Tutors",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    },
    {
      title: "CBT-Based Learning",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Small Class Sizes",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Affordable Fees",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "High Success Rate",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Admission Guidance",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    }
  ];

  return (
    <section id="about" className="py-20 bg-black text-white px-4 border-t border-yellow-500/20">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
          <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">About Us</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-2">Welcome to LEGIT TUTORS</h2>
        </div>

        <div className="bg-neutral-900 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          <p className="text-gray-300 leading-relaxed mb-6 text-lg md:text-xl">
            <strong className="text-white">LEGIT TUTORS</strong> is a leading educational center dedicated to preparing students for outstanding success in JAMB, WAEC, NECO, GCE, and Post-UTME examinations.
          </p>
          <p className="text-gray-300 leading-relaxed mb-10 text-lg">
            Our experienced tutors, modern teaching methods, CBT practice, and personalized mentoring have helped hundreds of students gain admission into top Nigerian universities.
          </p>

          <div className="border-t border-yellow-500/20 pt-8">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Why Choose Us</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {features.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 bg-neutral-950 p-4 rounded-xl border border-yellow-500/10 hover:border-yellow-500/40 transition-colors"
                >
                  <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-gray-200 text-sm">{item.title}</span>
                </div>
              ))}

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}