import { esES } from "@clerk/localizations";

export const clerkLocalization = {
  ...esES,
  formFieldAction__forgotPassword: "¿Olvidaste tu contraseña?",
  formFieldInputPlaceholder__signUpPassword: "Creá una contraseña",
  signIn: {
    ...esES.signIn,
    start: {
      ...esES.signIn?.start,
      title: "Iniciar sesión",
      subtitle: "Accedé con Google o con tu email",
      actionText: "¿Todavía no tenés cuenta?",
      actionLink: "Crear cuenta",
    },
    password: {
      ...esES.signIn?.password,
      title: "Ingresá tu contraseña",
      subtitle: "Usá la contraseña de tu cuenta T.PlayGames",
    },
    forgotPasswordAlternativeMethods: {
      ...esES.signIn?.forgotPasswordAlternativeMethods,
      title: "Recuperar contraseña",
    },
    forgotPassword: {
      ...esES.signIn?.forgotPassword,
      title: "Recuperar contraseña",
      subtitle: "Ingresá el código que enviamos a tu email",
    },
  },
  signUp: {
    ...esES.signUp,
    start: {
      ...esES.signUp?.start,
      title: "Crear cuenta",
      titleCombined: "Crear cuenta",
      subtitle: "Registrate con Google o con tu email",
      subtitleCombined: "Registrate con Google o con tu email",
      actionText: "¿Ya tenés una cuenta?",
      actionLink: "Iniciar sesión",
    },
  },
};
