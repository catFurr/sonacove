import React from "react";
import gdprBadge from "../assets/gdpr-compliant.png";
import soc2Badge from "../assets/soc2-type2-certified.png";
import uptimeBadge from "../assets/uptime-guarantee.png";
import isoBadge from "../assets/iso-certified.png";

const badges = [
  {
    img: gdprBadge,
    text: "GDPR Compliant",
  },
  {
    img: soc2Badge,
    text: "SOC 2 Type II Certified",
  },
  {
    img: uptimeBadge,
    text: "99.9% Uptime Guarantee",
  },
  {
    img: isoBadge,
    text: "ISO 27001 Security Standards",
  },
];

const CertificationsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-lg font-semibold text-orange-500 mb-2">Certifications</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Backed by the highest standards
          </h2>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 max-w-6xl mx-auto">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="bg-gray-50/50 rounded-2xl p-6 text-center border border-gray-200/80 hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={badge.img.src}
                alt={badge.text}
                className="h-24 w-auto mx-auto mb-6 object-contain"
              />
              <p className="font-semibold text-gray-700">{badge.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
