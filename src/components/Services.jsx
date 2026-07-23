import { useState } from 'react';

export default function Services() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const servicesList = [
    {
      title: "JAMB / UTME Preparation",
      icon: "📚",
      shortDesc: "Intensive training and syllabus coverage to help you score 300+ in your upcoming JAMB examinations.",
      fullDesc: "Our JAMB preparatory classes cover the entire syllabus with a focus on past questions, time management, and tackling difficult subjects. We simulate real exam conditions to eliminate fear and build total confidence before your test day."
    },
    {
      title: "WAEC, NECO & GCE Classes",
      icon: "🎓",
      shortDesc: "Comprehensive subject coverage to guarantee your A's and B's in all O'Level examinations.",
      fullDesc: "We provide detailed explanations, practical sessions, and theory breakdowns for both science and art subjects. Our curriculum is tailored strictly to the current WAEC and NECO syllabus to ensure maximum performance."
    },
    {
      title: "Computer Based Test (CBT) Training",
      icon: "💻",
      shortDesc: "Master the computer interface and typing speed required for modern digital examinations.",
      fullDesc: "Many students fail not because they lack knowledge, but because they are unfamiliar with computers. Our dedicated CBT center ensures you are comfortable navigating, selecting answers, and managing your time on a digital screen."
    },
    {
      title: "Post-UTME & Admission Guidance",
      icon: "🏛️",
      shortDesc: "Step-by-step mentoring from institutional screening registration to your final admission letter.",
      fullDesc: "We don't just stop at JAMB. We guide you through your chosen university's Post-UTME screening, helping with registration deadlines, required documents, uploading of O'Level results, and specific institutional exam formats."
    }
  ];

  return (
    <section id="services" className="py-20 bg-neutral-950 text-white px-4 border-t border-yellow-500/20">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-16">
          <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">Our Expertise</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2">Services We Offer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesList.map((service, index) => (
            <div 
              key={index} 
              className="bg-neutral-900 border border-yellow-500/20 p-6 sm:p-8 rounded-2xl flex flex-col items-start transition-all hover:border-yellow-500/50"
            >
              <div className="text-3xl sm:text-4xl mb-4 bg-neutral-950 p-3 sm:p-4 rounded-full border border-yellow-500/10">
                {service.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 leading-snug">{service.title}</h3>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {service.shortDesc}
              </p>

              {/* Expandable Full Description */}
              <div 
                className={`w-full overflow-hidden transition-all duration-300 ${
                  expandedIndex === index ? 'max-h-60 opacity-100 mb-4' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-400 text-sm leading-relaxed bg-black/50 p-4 rounded-lg border-l-2 border-yellow-500">
                  {service.fullDesc}
                </p>
              </div>

              {/* Read More / Read Less Button */}
              <button 
                onClick={() => toggleExpand(index)}
                className="mt-auto text-yellow-500 hover:text-white font-semibold text-sm flex items-center gap-1 transition-colors pt-2"
              >
                {expandedIndex === index ? 'Read Less ↑' : 'Read More ↓'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}