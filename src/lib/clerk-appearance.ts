export const clerkAppearance = {
  theme: "simple",
  options: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: true,
    privacyPageUrl: "/privacidad",
    termsPageUrl: "/terminos-y-condiciones",
  },
  variables: {
    colorPrimary: "#1D6DFF",
    colorBackground: "#111318",
    colorForeground: "#FFFFFF",
    colorPrimaryForeground: "#FFFFFF",
    colorMutedForeground: "#A7ACB8",
    colorMuted: "#171A21",
    colorNeutral: "#A7ACB8",
    colorInput: "#0B0D11",
    colorInputForeground: "#FFFFFF",
    colorBorder: "rgba(255, 255, 255, 0.14)",
    colorRing: "rgba(29, 109, 255, 0.32)",
    colorShadow: "#000000",
    colorDanger: "#FCA5A5",
    colorSuccess: "#86EFAC",
    colorWarning: "#FDE68A",
    borderRadius: "10px",
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    fontFamilyButtons: "var(--font-geist-sans), Arial, sans-serif",
    fontSize: "0.875rem",
    spacing: "0.875rem",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "500px",
    },
    cardBox: {
      width: "100%",
      maxWidth: "500px",
      boxShadow: "none",
    },
    card: {
      width: "100%",
      padding: "clamp(1.25rem, 4vw, 2rem)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "12px",
      background:
        "linear-gradient(180deg, rgba(17, 19, 24, 0.98), rgba(10, 12, 17, 0.98))",
      boxShadow:
        "0 24px 70px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(29, 109, 255, 0.04)",
    },
    header: {
      alignItems: "flex-start",
      gap: "0.375rem",
      marginBottom: "0.25rem",
    },
    headerTitle: {
      color: "#FFFFFF",
      fontSize: "1.75rem",
      fontWeight: 850,
      lineHeight: 1.15,
      letterSpacing: "0",
    },
    headerSubtitle: {
      color: "#B8BDC8",
      fontSize: "0.9375rem",
      lineHeight: 1.5,
      textAlign: "left",
    },
    main: {
      gap: "1rem",
    },
    socialButtons: {
      gap: "0.75rem",
    },
    socialButtonsBlockButton: {
      width: "100%",
      minHeight: "50px",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "9px",
      background: "#171A21",
      color: "#FFFFFF",
      boxShadow: "none",
      transition:
        "background-color 160ms ease, border-color 160ms ease, transform 160ms ease",
      "&:hover": {
        borderColor: "rgba(29, 109, 255, 0.58)",
        background: "#1D222D",
      },
      "&:focus-visible": {
        outline: "3px solid rgba(29, 109, 255, 0.32)",
        outlineOffset: "2px",
      },
      "&:active": {
        transform: "translateY(1px)",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#FFFFFF",
      fontSize: "0.875rem",
      fontWeight: 750,
    },
    dividerRow: {
      gap: "0.75rem",
      marginBlock: "0.125rem",
    },
    dividerLine: {
      background: "rgba(255, 255, 255, 0.1)",
    },
    dividerText: {
      color: "#858C9B",
      fontSize: "0.75rem",
    },
    form: {
      gap: "0.875rem",
    },
    formField: {
      gap: "0.4rem",
    },
    formFieldLabel: {
      color: "#D7DAE2",
      fontSize: "0.8125rem",
      fontWeight: 700,
    },
    formFieldInput: {
      minHeight: "50px",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      borderRadius: "9px",
      background: "#0B0D11",
      color: "#FFFFFF",
      fontSize: "0.9375rem",
      caretColor: "#8FB7FF",
      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)",
      transition:
        "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
      "&::placeholder": {
        color: "#737B8B",
        opacity: 1,
      },
      "&:hover": {
        borderColor: "rgba(255, 255, 255, 0.22)",
      },
      "&:focus": {
        borderColor: "#1D6DFF",
        background: "#0D1016",
        boxShadow: "0 0 0 3px rgba(29, 109, 255, 0.22)",
      },
    },
    formFieldInputShowPasswordButton: {
      color: "#A7ACB8",
      "&:hover": { color: "#FFFFFF" },
      "&:focus-visible": {
        outline: "2px solid #1D6DFF",
        outlineOffset: "2px",
      },
    },
    formButtonPrimary: {
      width: "100%",
      minHeight: "50px",
      borderRadius: "9px",
      background: "#1D6DFF",
      color: "#FFFFFF",
      fontSize: "0.875rem",
      fontWeight: 800,
      boxShadow: "0 14px 30px rgba(29, 109, 255, 0.25)",
      transition:
        "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
      "&:hover": {
        background: "#1558D6",
        boxShadow: "0 16px 34px rgba(29, 109, 255, 0.32)",
      },
      "&:focus-visible": {
        outline: "3px solid rgba(143, 183, 255, 0.45)",
        outlineOffset: "2px",
      },
      "&:active": {
        transform: "translateY(1px)",
      },
    },
    formFieldAction: {
      color: "#8FB7FF",
      fontWeight: 700,
      "&:hover": { color: "#FFFFFF" },
    },
    formFieldErrorText: {
      color: "#FCA5A5",
      fontSize: "0.78rem",
      lineHeight: 1.45,
    },
    alert: {
      border: "1px solid rgba(245, 158, 11, 0.3)",
      background: "rgba(245, 158, 11, 0.09)",
      color: "#FDE68A",
    },
    alertText: {
      color: "#FDE68A",
      lineHeight: 1.5,
    },
    identityPreview: {
      border: "1px solid rgba(255, 255, 255, 0.12)",
      background: "#0B0D11",
    },
    identityPreviewText: {
      color: "#FFFFFF",
    },
    identityPreviewEditButton: {
      color: "#8FB7FF",
      fontWeight: 700,
    },
    alternativeMethodsBlockButton: {
      minHeight: "48px",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      background: "#171A21",
      color: "#FFFFFF",
    },
    footer: {
      paddingTop: "1rem",
      background: "transparent",
    },
    footerAction: {
      gap: "0.375rem",
    },
    footerActionText: {
      color: "#A7ACB8",
      fontSize: "0.8125rem",
    },
    footerActionLink: {
      color: "#8FB7FF",
      fontSize: "0.8125rem",
      fontWeight: 750,
      "&:hover": { color: "#FFFFFF" },
      "&:focus-visible": {
        outline: "2px solid #1D6DFF",
        outlineOffset: "2px",
      },
    },
    footerItem: {
      color: "#858C9B",
      fontSize: "0.6875rem",
      opacity: 0.62,
    },
  },
} as const;
