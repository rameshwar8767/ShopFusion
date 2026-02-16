// pages/ExpiringSoonRecommendations.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const ExpiringSoonRecommendations = () => {
  const { urgentBundles = [] } = useSelector(
    (state) => state.recommendations || {}
  );

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const exp = new Date(expiryDate);
    const diff = (exp - now) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  // Flatten all products from urgentBundles, compute daysLeft, de‑duplicate
  const expiringProducts = useMemo(() => {
    const map = new Map(); // productId -> { productId, name, daysLeft }

    (urgentBundles || []).forEach((bundle) => {
      (bundle.products || []).forEach((item) => {
        const daysLeft = getDaysLeft(item.expiryDate);
        if (daysLeft == null || daysLeft < 0) return; // skip expired / no date

        const existing = map.get(item.productId);
        // keep the one with the minimum daysLeft (most urgent)
        if (!existing || daysLeft < existing.daysLeft) {
          map.set(item.productId, {
            productId: item.productId,
            name: item.name,
            daysLeft,
          });
        }
      });
    });

    // sort by urgency: least days first
    return Array.from(map.values()).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [urgentBundles]);

  if (!expiringProducts.length) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3 text-red-600">
          Expiring Soon – Sell Now
        </h3>
        <p className="text-sm text-gray-500">
          No near-expiry products detected right now.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-red-600">
        Expiring Soon – Sell Now
      </h3>
      <div className="space-y-2">
        {expiringProducts.slice(0, 6).map((p) => (
          <div
            key={p.productId}
            className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {p.name}
              </span>
              <span className="text-[11px] text-gray-500">
                {p.productId}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">
                {p.daysLeft} day{p.daysLeft !== 1 ? "s" : ""} left
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpiringSoonRecommendations;
