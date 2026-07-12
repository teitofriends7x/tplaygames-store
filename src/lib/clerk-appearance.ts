export const clerkAppearance = {
  variables: {
    colorPrimary: "#1D6DFF",
    colorBackground: "#111318",
    colorInputBackground: "#0B0D11",
    colorInputText: "#FFFFFF",
    colorText: "#FFFFFF",
    colorTextSecondary: "#A7ACB8",
    colorDanger: "#FCA5A5",
    borderRadius: "10px",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full border border-white/10 bg-[#111318] p-6 shadow-none md:p-8",
    headerTitle: "text-2xl font-black text-white",
    headerSubtitle: "text-sm leading-6 text-[#A7ACB8]",
    socialButtonsBlockButton:
      "min-h-11 border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    socialButtonsBlockButtonText: "font-bold text-white",
    dividerLine: "bg-white/10",
    dividerText: "text-[#737986]",
    formFieldLabel: "font-semibold text-[#A7ACB8]",
    formFieldInput:
      "min-h-11 border-white/15 bg-[#0B0D11] text-white focus:border-[#1D6DFF] focus:ring-[#1D6DFF]/25",
    formButtonPrimary:
      "min-h-11 bg-[#1D6DFF] font-black text-white hover:bg-[#3B82F6]",
    footerActionText: "text-[#A7ACB8]",
    footerActionLink: "font-bold text-[#8FB7FF] hover:text-white",
    formFieldErrorText: "text-[#FCA5A5]",
    alertText: "text-[#FDE68A]",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-[#8FB7FF]",
    footer: "bg-transparent",
  },
} as const;
