import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function Hero({ title, subtitle, ctaText, ctaHref }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-b from-background via-background to-muted py-20 md:py-40 px-4 overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent/3 rounded-full blur-3xl -z-10 opacity-40"></div>

      <div className="max-w-5xl mx-auto">
        {/* Glass card container */}
        <div className="glass-lg rounded-2xl p-8 md:p-16 fade-up">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 text-pretty leading-tight">
              {title}
            </h1>

            {subtitle && (
              <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-3xl mx-auto text-pretty leading-relaxed">
                {subtitle}
              </p>
            )}

            {ctaText && ctaHref && (
              <Link href={ctaHref}>
                <Button 
                  size="lg" 
                  className="text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {ctaText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
