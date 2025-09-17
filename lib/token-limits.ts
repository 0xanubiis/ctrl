export const TOKEN_LIMITS = {
  FREE: Number.parseInt(process.env.TOKENS_FREE || "25"),
  STARTER: Number.parseInt(process.env.TOKENS_STARTER || "100"),
  PRO: Number.parseInt(process.env.TOKENS_PRO || "250"),
  PREMIUM: Number.parseInt(process.env.TOKENS_PREMIUM || "500"),
} as const

export type PlanType = keyof typeof TOKEN_LIMITS

export function getTokenLimitForPlan(planId: string): number {
  switch (planId.toLowerCase()) {
    case "free":
      return TOKEN_LIMITS.FREE
    case "starter":
    case "pro": // Handle legacy 'pro' as 'starter'
      return TOKEN_LIMITS.STARTER
    case "enterprise": // Handle legacy 'enterprise' as 'pro'
      return TOKEN_LIMITS.PRO
    case "premium":
      return TOKEN_LIMITS.PREMIUM
    default:
      return TOKEN_LIMITS.FREE
  }
}

export function validateTokenConsumption(tokensToConsume: number, tokensRemaining: number): boolean {
  return tokensRemaining >= tokensToConsume && tokensToConsume > 0
}
