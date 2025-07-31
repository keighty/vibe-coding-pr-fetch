import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { trace } from '@opentelemetry/api';

let sdk: HoneycombWebSDK | null = null;

export function initializeHoneycomb() {
  // Only initialize on the client side
  if (typeof window === 'undefined') {
    return;
  }

  // Don't initialize multiple times
  if (sdk) {
    return sdk;
  }

  const apiKey = process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY;
  const serviceName = process.env.NEXT_PUBLIC_HONEYCOMB_SERVICE_NAME || 'github-contributions-frontend';
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

  if (!apiKey) {
    console.warn('Honeycomb API key not found. Observability will not be enabled.');
    return;
  }

  sdk = new HoneycombWebSDK({
    apiKey,
    serviceName,
    // Configure sampling (optional - adjust based on your needs)
    sampleRate: 1, // Sample 100% of traces in development
    // Add environment as a resource attribute
    resourceAttributes: {
      'service.environment': environment,
    },
  });

  sdk.start();
  
  console.log('Honeycomb Frontend Observability initialized');
  return sdk;
}

export function getHoneycombSDK() {
  return sdk;
}

// Helper function to add custom attributes to the current span
export function addCustomAttributes(attributes: Record<string, string | number | boolean>) {
  const span = trace.getActiveSpan();
  
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttributes({ [key]: value });
    });
  }
}

// Helper function to create custom spans for important operations
export function createCustomSpan<T>(
  name: string, 
  operation: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = trace.getTracer('github-contributions-custom');
  
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }
      
      const result = await operation();
      span.setStatus({ code: 1 }); // OK status
      return result;
    } catch (error) {
      span.setStatus({ 
        code: 2, // ERROR status
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}
