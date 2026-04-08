import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export default function Blog() {
  const blogPosts = [
    {
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      alt: "Strategic facility management planning session with documents and charts",
      category: "Strategy",
      categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      title: "5 Key Strategies for Modern Facility Management",
      description: "Discover proven strategies that leading facilities use to optimize operations, reduce costs, and improve tenant satisfaction.",
      readTime: "5 min read",
      arrowColor: "text-blue-500"
    },
    {
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      alt: "Modern technology solutions for facility management including IoT sensors and digital displays",
      category: "Technology",
      categoryColor: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      title: "QR Codes: The Future of Facility Reporting",
      description: "Learn how QR code technology is revolutionizing facility maintenance and problem reporting across industries.",
      readTime: "3 min read",
      arrowColor: "text-blue-400"
    },
    {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      alt: "Financial analysis and cost optimization charts for facility management operations",
      category: "ROI",
      categoryColor: "bg-green-500/20 text-green-400 border-green-500/30",
      title: "Maximizing ROI Through Preventive Maintenance",
      description: "Understand how preventive maintenance programs can significantly reduce costs and extend asset lifecycles.",
      readTime: "7 min read",
      arrowColor: "text-green-500"
    }
  ];

  return (
    <section className="py-20 gradient-bg">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">
            FROM OUR BLOG
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Latest Insights & Updates
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay informed with the latest trends in facility management, technology insights, 
            and best practices from industry experts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <Card key={index} className="glass-card border-border overflow-hidden hover:scale-105 transition-transform cursor-pointer">
              <div className="relative">
                <img 
                  src={post.image}
                  alt={post.alt}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardHeader>
                <Badge className={`w-fit ${post.categoryColor}`}>
                  {post.category}
                </Badge>
                <CardTitle className="text-xl text-foreground mt-2">{post.title}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  <ArrowRight className={`w-4 h-4 ${post.arrowColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" className="border-2 border-border hover:bg-accent hover:border-accent-foreground text-foreground bg-transparent">
            More Articles <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
