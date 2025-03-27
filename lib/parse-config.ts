export const initializeParse = () => {
  // Verificar se Parse já está inicializado
  if (typeof window !== "undefined" && !(window as any).parseInitialized) {
    const Parse = require("parse")

    // Inicializar Parse com as credenciais do Back4App
    Parse.initialize(process.env.NEXT_PUBLIC_PARSE_APP_ID, process.env.NEXT_PUBLIC_PARSE_JS_KEY)

    // Definir o servidor Parse
    Parse.serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL

    // Marcar como inicializado
    ;(window as any).parseInitialized = true
  }
}

