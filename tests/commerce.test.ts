import { buildPaymentInstructions, calculateCheckoutTotals, getDeliveryFee } from "@/lib/commerce"

describe("commerce helpers", () => {
  it("calculates checkout totals with Dar es Salaam delivery", () => {
    const totals = calculateCheckoutTotals({
      customerName: "Asha M.",
      email: "asha@example.com",
      phone: "+255700000000",
      region: "Dar es Salaam",
      city: "Dar es Salaam",
      district: "Ilala",
      addressLine: "Kariakoo",
      notes: "",
      paymentMethod: "CASH_ON_DELIVERY",
      items: [
        { slug: "tv", name: "TV", price: 1000000, quantity: 1 },
        { slug: "kettle", name: "Kettle", price: 80000, discountPrice: 70000, quantity: 2 },
      ],
    })

    expect(totals.subtotal).toBe(1140000)
    expect(totals.deliveryFee).toBe(15000)
    expect(totals.grandTotal).toBe(1155000)
  })

  it("uses higher delivery fees outside Dar es Salaam", () => {
    expect(getDeliveryFee("Mwanza")).toBe(25000)
    expect(getDeliveryFee("Zanzibar")).toBe(35000)
  })

  it("builds payment instructions for manual mobile money", () => {
    expect(buildPaymentInstructions("MOBILE_MONEY_MANUAL", 250000)).toContain("mobile money")
  })
})
