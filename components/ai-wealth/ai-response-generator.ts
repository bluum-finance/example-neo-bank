export function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Question 1: What are the best investment opportunities right now?
  if (
    lowerMessage.includes('best investment opportunities') ||
    lowerMessage.includes('investment opportunities right now') ||
    lowerMessage.includes('what should i invest in') ||
    lowerMessage.includes('investment recommendations')
  ) {
    return `Based on current market conditions, here are my recommendations:\n\n• **Technology**: Focus on companies with strong fundamentals and AI exposure\n• **Healthcare**: Consider dividend-paying pharma stocks for stability\n• **Consumer**: Look for brands with strong moats and consistent growth\n• **Diversification**: Consider ETFs like SPY or QQQ for broad market exposure\n\nRemember to align investments with your risk tolerance and time horizon.`;
  }

  // Question 2: What is the current market outlook and key trends?
  if (
    lowerMessage.includes('current market outlook') ||
    lowerMessage.includes('market outlook and key trends') ||
    lowerMessage.includes('market trends') ||
    lowerMessage.includes('market performance')
  ) {
    return `Current market analysis:\n\n• **Market Sentiment**: Cautiously optimistic with some volatility expected\n• **Key Trends**: Technology and healthcare sectors showing resilience\n• **Interest Rates**: Keep an eye on Fed policy changes affecting bond yields\n• **Recommendation**: Stay diversified, avoid timing the market\n\nFor your portfolio, consider maintaining defensive positions while keeping growth exposure.`;
  }

  // Question 3: What's my risk level?
  if (
    lowerMessage.includes('what is my risk') ||
    lowerMessage.includes('risk assessment') ||
    lowerMessage.includes('how risky is my portfolio') ||
    lowerMessage.includes('risk level')
  ) {
    return `Your portfolio risk assessment:\n\n• **Current Risk Profile**: Moderate risk with good diversification\n• **Volatility**: Your holdings show moderate volatility, suitable for medium-term goals\n• **Recommendations**:\n  - Maintain 60-70% in diversified stocks\n  - Keep 20-30% in bonds or fixed income\n  - Hold 10-15% cash for opportunities\n\nYour current allocation aligns well with a moderate risk tolerance.`;
  }

  // Question 4: How are my investments performing?
  if (
    lowerMessage.includes('how are my investments') ||
    lowerMessage.includes('portfolio performance') ||
    lowerMessage.includes('how am i doing') ||
    lowerMessage.includes('investment returns')
  ) {
    return `Your portfolio performance overview:\n\n• **Total Return**: Your portfolio is performing well relative to benchmarks\n• **Key Metrics**: Risk-adjusted returns are solid, showing good risk management\n• **Top Performers**: Technology and healthcare positions leading gains\n• **Areas to Watch**: Consider rebalancing overweight positions\n\nFocus on long-term trends rather than daily fluctuations.`;
  }

  // Question 5: Should I sell my stocks?
  if (
    lowerMessage.includes('should i sell') ||
    lowerMessage.includes('when to sell') ||
    lowerMessage.includes('sell my stocks') ||
    lowerMessage.includes('exit position')
  ) {
    return `Selling decisions should be based on your investment strategy:\n\n• **Consider Selling If**:\n  - Stock no longer fits your investment thesis\n  - You need to rebalance your portfolio\n  - You've reached your profit target\n\n• **Consider Holding If**:\n  - Fundamentals remain strong\n  - Long-term growth story intact\n  - Tax implications favor holding\n\n• **Best Practice**: Avoid emotional decisions, stick to your plan`;
  }

  // Portfolio analysis
  if (
    lowerMessage.includes('review portfolio') ||
    lowerMessage.includes('review my portfolio') ||
    lowerMessage.includes('review holdings') ||
    lowerMessage.includes('portfolio analysis') ||
    lowerMessage.includes('analyze my portfolio')
  ) {
    return `Based on your current portfolio, here's my analysis:\n\n• **Diversification**: Your portfolio shows good sector diversification\n• **Risk Level**: Moderate risk profile with balanced allocation\n• **Recommendation**: Consider rebalancing quarterly to maintain target allocation\n• **Top Holdings**: Your largest positions are performing well`;
  }

  // General greeting or help
  if (
    lowerMessage.includes('hello') ||
    lowerMessage.includes('hi') ||
    lowerMessage.includes('what can you do')
  ) {
    return `Hello, I'm here to help with your investment journey! I can assist you with:\n\n📊 **Portfolio Analysis** - Review your holdings and suggest optimizations\n💡 **Investment Recommendations** - Get personalized stock and ETF suggestions\n📈 **Market Insights** - Stay updated on trends and opportunities\n⚖️ **Risk Assessment** - Evaluate and manage your risk exposure\n📉 **Performance Tracking** - Analyze returns and benchmark comparisons`;
  }

  // Default intelligent response
  return `I didn't quite understand that. I can help with portfolio analysis, investment recommendations, market insights, risk assessment, and performance tracking. Could you rephrase your question?`;
}
