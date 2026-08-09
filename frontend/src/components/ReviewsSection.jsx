import React from "react";
import { Star, CheckCircle } from "lucide-react";

const REVIEWS = [
  {
    id: "1",
    name: "Rajesh Sharma",
    city: "New Delhi",
    rating: 5,
    date: "2 days ago",
    comment:
      "The Kashmiri Saffron quality is exceptional! Fresh aroma and authentic color. Ordering via WhatsApp was very smooth.",
  },
  {
    id: "2",
    name: "Priya Patel",
    city: "Ahmedabad",
    rating: 5,
    date: "1 week ago",
    comment:
      "Jumbo Mamra almonds were fresh and crispy. Packaging kept everything intact during international shipping.",
  },
  {
    id: "3",
    name: "Ananya Roy",
    city: "Kolkata",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Very fast response on WhatsApp for payment and shipping details. Will definitely reorder cardamom and cashews.",
  },
];

export default function ReviewsSection() {
  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-amber-600 font-semibold text-xs tracking-widest uppercase">
            Verified Buyers
          </span>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mt-1">
            What Our Customers Say
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Trusted by over 10,000+ households across India and overseas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-[#FAF8F5] p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200/60 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900 block flex items-center gap-1">
                    {review.name}{" "}
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </span>
                  <span className="text-gray-400">{review.city}</span>
                </div>
                <span className="text-gray-400">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
