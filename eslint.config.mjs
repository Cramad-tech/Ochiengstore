import nextVitals from "eslint-config-next/core-web-vitals"

const config = [
  ...nextVitals,
  {
    ignores: ["prisma/migrations/**"],
  },
]

export default config
