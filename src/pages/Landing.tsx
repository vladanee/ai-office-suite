import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  BarChart3,
  Users,
  Workflow,
  Bot,
  CheckCircle2,
  Play,
  Star,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// Data
const features = [
  {
    icon: Bot,
    title: 'AI Personas',
    description: 'Create intelligent virtual team members with specialized skills, personalities, and domain expertise.',
    gradient: 'from-primary to-purple-500'
  },
  {
    icon: Workflow,
    title: 'Visual Workflows',
    description: 'Design complex automation flows with our intuitive drag-and-drop builder. No code required.',
    gradient: 'from-accent to-primary'
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    description: 'Run workflows in real-time with blazing-fast execution. Scale from prototype to production.',
    gradient: 'from-warning to-orange-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, SOC 2 compliance, and role-based access control built-in.',
    gradient: 'from-success to-accent'
  }
];

const stats = [
  { value: '10x', label: 'Faster Task Completion' },
  { value: '85%', label: 'Cost Reduction' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'AI Availability' }
];

const testimonials = [
  {
    quote: "AI Office transformed how we handle customer support. Our response time dropped from hours to minutes.",
    author: "Sarah Chen",
    role: "VP of Operations, TechScale",
    avatar: "SC"
  },
  {
    quote: "The ROI was immediate. We automated 80% of our repetitive workflows in the first week.",
    author: "Marcus Johnson",
    role: "CEO, Velocity Labs",
    avatar: "MJ"
  },
  {
    quote: "Finally, AI that actually understands our business context. The personas are incredibly smart.",
    author: "Emily Rodriguez",
    role: "Head of Engineering, DataFlow",
    avatar: "ER"
  }
];

const useCases = [
  { title: 'Customer Support', description: 'Automate ticket routing, responses, and escalation' },
  { title: 'Sales Operations', description: 'Qualify leads, schedule meetings, update CRM' },
  { title: 'Content Creation', description: 'Generate, review, and publish content at scale' },
  { title: 'Data Processing', description: 'Extract, transform, and analyze data automatically' }
];

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AI Office</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <motion.section 
        id="main-content"
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-background" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ 
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px' 
          }} 
        />

        <div className="container mx-auto px-6 relative">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/30 bg-primary/5">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                Introducing AI Office 2.0
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              id="hero-heading"
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Your workspace,{' '}
              <span className="text-gradient">powered by AI</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Create AI personas, build intelligent workflows, and automate your entire business 
              operations. Ship faster. Scale effortlessly.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow text-base px-8" asChild>
                <Link to="/auth">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 group">
                <Play className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['SC', 'MJ', 'ED', 'AR'].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground border-2 border-background">
                      {initials}
                    </div>
                  ))}
                </div>
                <span>2,500+ teams</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="mt-16 md:mt-20 relative"
          >
            <div className="relative rounded-2xl border border-border/50 overflow-hidden glass">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
              
              {/* Mock Dashboard UI */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                
                <div className="grid grid-cols-12 gap-6">
                  {/* Sidebar Mock */}
                  <div className="col-span-3 hidden md:block">
                    <div className="space-y-2">
                      {['Dashboard', 'Personas', 'Workflows', 'Runs'].map((item, i) => (
                        <div key={item} className={`p-3 rounded-lg ${i === 0 ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Content Mock */}
                  <div className="col-span-12 md:col-span-9 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.map((stat) => (
                        <div key={stat.label} className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                          <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                          <Bot className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Support Agent AI</p>
                          <p className="text-xs text-muted-foreground">Processing 12 tickets...</p>
                        </div>
                        <div className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full gradient-primary"
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-4 -right-4 md:-top-8 md:-right-8 p-4 rounded-xl glass border border-border/50"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Workflow Complete</p>
                  <p className="text-xs text-muted-foreground">42 tasks automated</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 p-4 rounded-xl glass border border-border/50"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">10x Faster</p>
                  <p className="text-xs text-muted-foreground">Than manual processes</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Logos Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by innovative teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50">
            {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'].map((company) => (
              <span key={company} className="text-lg md:text-xl font-semibold text-muted-foreground">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-4">Features</Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="text-gradient">automate work</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform for building, deploying, and managing AI-powered automation at scale.
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature) => (
              <motion.div 
                key={feature.title}
                variants={fadeInUp}
                className="group p-8 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-4">How It Works</Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-4">
              Three steps to{' '}
              <span className="text-gradient-accent">automation bliss</span>
            </motion.h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { step: '01', title: 'Create Personas', description: 'Define AI team members with specific roles, skills, and personalities tailored to your workflows.' },
              { step: '02', title: 'Build Workflows', description: 'Use our visual builder to connect tasks, conditions, and triggers. No coding needed.' },
              { step: '03', title: 'Deploy & Scale', description: 'Launch your automation and watch your AI team handle work 24/7. Scale instantly.' }
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeInUp} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-border" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div variants={fadeInUp}>
                  <Badge variant="outline" className="mb-4">Use Cases</Badge>
                </motion.div>
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
                  Automate any{' '}
                  <span className="text-gradient">business process</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-8">
                  From customer support to sales operations, AI Office handles the repetitive work so your team can focus on what matters.
                </motion.p>
                <motion.div variants={staggerContainer} className="space-y-4">
                  {useCases.map((useCase) => (
                    <motion.div 
                      key={useCase.title}
                      variants={fadeInUp}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{useCase.title}</h4>
                        <p className="text-sm text-muted-foreground">{useCase.description}</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div variants={scaleIn} className="relative">
                <div className="aspect-square rounded-3xl gradient-surface border border-border/50 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
                      <BarChart3 className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <p className="text-4xl font-bold text-gradient mb-2">85%</p>
                    <p className="text-muted-foreground">Average cost reduction</p>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-3xl border border-primary/20 scale-105" />
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-3xl border border-primary/10 scale-110" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold">
              Loved by{' '}
              <span className="text-gradient">forward-thinking teams</span>
            </motion.h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial) => (
              <motion.div 
                key={testimonial.author}
                variants={fadeInUp}
                className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-semibold text-primary-foreground">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
            
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to transform{' '}
                <span className="text-gradient">your workspace?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Start free and scale as you grow. No credit card required. 
                Full access to all features for 14 days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow text-base px-10" asChild>
                  <Link to="/auth">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-10">
                  Talk to Sales
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border/50" role="contentinfo">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg w-fit">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AI Office</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-xs">
                The AI-powered workspace automation platform for modern teams.
              </p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2" role="list">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:text-foreground focus-visible:underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Office. All rights reserved.
            </p>
            <div className="flex items-center gap-6" role="list" aria-label="Social links">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:text-foreground focus-visible:underline"
                  aria-label={`Follow us on ${social}`}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
