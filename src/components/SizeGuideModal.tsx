import React from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#ffffff] max-w-xl w-full rounded-2xl p-6 md:p-8 relative shadow-2xl space-y-6 fade-in-up border border-[#c4c7c7]/30">
        <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-4">
          <h2 className="font-display text-[26px] text-[#000000] font-bold">Size &amp; Fit Guide</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#111111] flex items-center justify-center transition-all cursor-pointer border border-[#d1d5db] shadow-xs active:scale-95"
            title="Close (X)"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <p className="font-body text-[14px] text-[#444748]">
          Maison Élégant garments are cut to standard French / European sizing. If you prefer a relaxed fit, we recommend selecting one size up.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-[14px]">
            <thead>
              <tr className="border-b border-[#000000] font-label-caps text-[#000000]">
                <th className="py-2">FR / EU</th>
                <th className="py-2">US</th>
                <th className="py-2">Bust (cm)</th>
                <th className="py-2">Waist (cm)</th>
                <th className="py-2">Hips (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c7c7]/30 text-[#444748]">
              <tr>
                <td className="py-3 font-semibold text-[#000000]">34 (XS)</td>
                <td>0-2</td>
                <td>80 - 83</td>
                <td>60 - 63</td>
                <td>86 - 89</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#000000]">36 (S)</td>
                <td>4</td>
                <td>84 - 87</td>
                <td>64 - 67</td>
                <td>90 - 93</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#000000]">38 (M)</td>
                <td>6</td>
                <td>88 - 91</td>
                <td>68 - 71</td>
                <td>94 - 97</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#000000]">40 (L)</td>
                <td>8-10</td>
                <td>92 - 95</td>
                <td>72 - 75</td>
                <td>98 - 101</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#f3f3f4] p-4 rounded-xl font-body text-[13px] text-[#444748]">
          <strong>Need personal sizing advice?</strong> Our Client Advisory team can assist with bespoke measurements. Email concierge@maisonelegant.com
        </div>
      </div>
    </div>
  );
};
