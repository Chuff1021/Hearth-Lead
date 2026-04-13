/**
 * AI-powered Google Business review response generator.
 *
 * Generates professional, on-brand responses for Aaron's Fireplace.
 * Works with or without an external AI API — has built-in templates as fallback.
 */

interface ReviewInput {
  reviewerName: string;
  rating: number;
  text: string | null;
  platform: string;
}

export function generateReviewResponse(review: ReviewInput): string {
  const name = review.reviewerName.split(' ')[0]; // First name only

  if (review.rating >= 4) {
    return generatePositiveResponse(name, review.text, review.rating);
  } else if (review.rating === 3) {
    return generateNeutralResponse(name, review.text);
  } else {
    return generateNegativeResponse(name, review.text);
  }
}

function generatePositiveResponse(name: string, text: string | null, rating: number): string {
  // Personalize based on what they mentioned
  const lower = (text || '').toLowerCase();

  if (lower.includes('install')) {
    return `Thank you ${name}! We take a lot of pride in our installations, so it's great to hear everything went well. If you ever need anything — maintenance, accessories, or just want to show off your fireplace to friends — we're here. Enjoy the warmth!`;
  }
  if (lower.includes('staff') || lower.includes('help') || lower.includes('knowledge')) {
    return `Thanks ${name}! Our team loves helping people find the perfect fireplace. We're glad we could help you make the right choice. Don't hesitate to reach out if you have any questions down the road!`;
  }
  if (lower.includes('showroom') || lower.includes('selection') || lower.includes('store')) {
    return `Thank you ${name}! We've worked hard to have a showroom where you can see and feel the options in person — it makes such a difference. Thanks for visiting and for the kind words!`;
  }
  if (lower.includes('price') || lower.includes('value') || lower.includes('deal')) {
    return `Appreciate that ${name}! We work hard to offer fair, competitive pricing. Glad we could deliver value for you. Enjoy your new fireplace!`;
  }
  if (lower.includes('outdoor') || lower.includes('patio')) {
    return `Thank you ${name}! Outdoor fireplaces are one of our favorite projects — there's nothing like a fire on an Ozarks evening. Glad you love it! Enjoy the patio.`;
  }

  // Generic positive
  const responses = [
    `Thank you so much ${name}! We really appreciate you taking the time to share your experience. It means a lot to our small business. Enjoy the fireplace!`,
    `Thanks ${name}! We're glad everything went well. If you ever need anything in the future, don't hesitate to reach out. Enjoy!`,
    `Really appreciate the ${rating}-star review ${name}! We love what we do and it's great to hear our customers do too. Thanks for choosing Aaron's Fireplace!`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateNeutralResponse(name: string, text: string | null): string {
  const lower = (text || '').toLowerCase();

  if (lower.includes('wait') || lower.includes('time') || lower.includes('delay')) {
    return `Thank you for the feedback ${name}. We completely understand the frustration with wait times — we're always working to improve our turnaround. If there's anything we can do to make it right, please give us a call at (417) 823-3411. We appreciate your business.`;
  }
  if (lower.includes('communication') || lower.includes('call') || lower.includes('response')) {
    return `Thank you for the honest feedback ${name}. Communication is something we take seriously, and we're sorry we fell short. We're making changes to ensure better updates throughout the process. Please don't hesitate to reach out directly if we can help further.`;
  }

  return `Thank you for the feedback ${name}. We appreciate your honest review and take it seriously. If there's anything we can do to improve your experience, please call me directly at (417) 823-3411. — Aaron`;
}

function generateNegativeResponse(name: string, text: string | null): string {
  const lower = (text || '').toLowerCase();

  if (lower.includes('defect') || lower.includes('broken') || lower.includes('damage')) {
    return `${name}, I'm really sorry to hear about this issue. A manufacturer defect is frustrating and I understand your disappointment with how long the resolution took. That's not the experience we want for our customers. I'd like to personally make sure everything is resolved. Please call me directly at (417) 823-3411 so we can discuss this. — Aaron`;
  }

  return `${name}, I'm sorry to hear about your experience. This isn't the standard we hold ourselves to. I'd really appreciate the chance to make this right. Please call me directly at (417) 823-3411 or stop by the store. I want to understand what happened and fix it. — Aaron`;
}

/**
 * Generate a Google Business post based on business context.
 */
export function generateGbpPost(type: 'promotion' | 'product' | 'seasonal' | 'project_showcase'): { title: string; body: string; ctaType: string } {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  switch (type) {
    case 'seasonal': {
      if (month >= 6 && month <= 9) { // Jul-Oct: pre-season
        return {
          title: 'Get Ahead of Fireplace Season',
          body: 'Fall is right around the corner! Now is the perfect time to schedule your fireplace installation or tune-up. Beat the rush and be cozy before the first cold snap. Schedule your free consultation today.',
          ctaType: 'call',
        };
      } else if (month >= 10 || month <= 1) { // Nov-Feb: peak season
        return {
          title: 'Stay Warm This Winter',
          body: 'Cold weather is here! Whether you need a new gas fireplace, an insert upgrade, or a seasonal tune-up, we\'ve got you covered. Stop by our showroom to see what\'s on display, or call for a free estimate.',
          ctaType: 'call',
        };
      } else { // Mar-Jun: off-season
        return {
          title: 'Off-Season Deals on Fireplaces',
          body: 'Spring and summer are the best time to buy a fireplace — shorter wait times, more availability, and off-season pricing. Planning a new home build? Talk to us before framing starts and save thousands.',
          ctaType: 'learn_more',
        };
      }
    }
    case 'promotion':
      return {
        title: 'This Month Only: Free Installation Estimate',
        body: 'Thinking about a fireplace for your home? This month we\'re offering free on-site installation estimates for any gas, wood, or electric fireplace. No obligation — just expert advice on what would work best in your space.',
        ctaType: 'call',
      };
    case 'product':
      return {
        title: 'New Arrivals in Our Showroom',
        body: 'We just received new models from Napoleon and Heat & Glo. Come see the latest linear gas fireplaces, traditional inserts, and outdoor fire features. Our showroom is open Mon-Fri 8-5, Sat 9-2.',
        ctaType: 'learn_more',
      };
    case 'project_showcase':
      return {
        title: 'Recent Install: Beautiful Stone Fireplace',
        body: 'Check out this gas fireplace we just installed in a new home in the Springfield area. Floor-to-ceiling stone surround with a reclaimed wood mantel. Our customer is thrilled with how it turned out. Want something similar? Give us a call!',
        ctaType: 'call',
      };
  }
}
