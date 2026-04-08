import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function Companies() {
  const { ref: companiesRef, isVisible: companiesVisible } = useScrollAnimation();
  
  const companies = [
    { name: "Grapho", logo: "G" },
    { name: "Signum", logo: "S" },
    { name: "Vectra", logo: "V" },
    { name: "Optimal", logo: "O" },
    { name: "Grapho", logo: "G" },
    { name: "Signum", logo: "S" }
  ];

  return (
    <section className="py-12 sm:py-16 bg-muted/50 border-t border-border/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={companiesRef} className="text-center mb-12">
          <p className={`text-muted-foreground text-sm font-medium tracking-wide uppercase ${companiesVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Trusted by leading facilities worldwide
          </p>
        </div>
        
        <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 lg:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500 ${companiesVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
          {companies.map((company, index) => (
            <div 
              key={index}
              className="group flex items-center gap-2 md:gap-3 hover:opacity-100 opacity-60 transition-all duration-300 cursor-pointer flex-shrink-0"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 bg-muted rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors">
                <span className="text-foreground font-bold text-xs md:text-sm">{company.logo}</span>
              </div>
              <span className="text-muted-foreground font-medium text-sm md:text-base lg:text-lg group-hover:text-foreground transition-colors whitespace-nowrap">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}